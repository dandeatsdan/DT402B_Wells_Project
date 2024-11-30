###################################################################################  
# Library imports
from flask import Flask, jsonify, render_template, Response, abort
import sqlite3
import pathlib
import logging
from flask_caching import Cache

###################################################################################  
# Configure logging to log to both the console and a file
logging.basicConfig(
    level=logging.DEBUG,  
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",  
    handlers=[
        logging.FileHandler("app.log"),  
        logging.StreamHandler()  
    ]
)

###################################################################################  
# Configure Flask app and caching
app = Flask(__name__)
cache = Cache(app, config={'CACHE_TYPE': 'simple'})

# Database setup
working_directory = pathlib.Path(__file__).parent.absolute()
DATABASE = working_directory / "Wells.db"

###################################################################################  
# Error Handlers
@app.errorhandler(404)
def not_found(error):
    logging.error(f"404 Error: {error}")
    return jsonify({"error": "Not found"}), 404

@app.errorhandler(500)
def internal_error(error):
    logging.error(f"500 Error: {error}")
    return jsonify({"error": "Internal server error"}), 500

@app.errorhandler(405)
def method_not_allowed(error):
    logging.error(f"405 Error: {error}")
    return jsonify({"error": "Method not allowed"}), 405

################################################################################### 
# Utility functions
def query_db(query: str, args=()) -> list:
    """Executes a query and returns the result."""
    try:
        with sqlite3.connect(DATABASE) as conn:
            cursor = conn.cursor()
            result = cursor.execute(query, args).fetchall()
        return result
    except sqlite3.Error as e:
        logging.error("Database error: %s", e)
        abort(500, description="Database error occurred.")

# Helper function to format query response to dictionary
def format_query_response(query: str, key1: str, key2: str) -> dict:
    """Utility function to format a query response as a dictionary."""
    result = query_db(query)
    values1 = [row[0] for row in result]
    values2 = [row[1] for row in result]
    return {key1: values1, key2: values2}

# Generalized function for routes returning grouped averages
def handle_grouped_avg_data(query: str, key1: str, key2: str) -> Response:
    data = format_query_response(query, key1, key2)
    return jsonify(data)

###################################################################################
# Routes
@app.route("/")
def index() -> str:
    return render_template("dashboard.html")

# Grouped average routes for days/cost per geological era
@app.route("/api/<column>_per_era", methods=["GET"])
@cache.cached(timeout=60)
def data_per_era(column: str) -> Response:
    if column not in ["days", "cost"]:
        abort(404, description="Invalid column")
    
    column_name = "Days_per_1000m" if column == "days" else "Cost_per_1000m"
    
    query = f"""
    WITH CTE_ERA AS (
    SELECT b.Era, AVG(a.{column_name}) AS avg_{column}
    FROM WellsDataTable a
    LEFT JOIN AgeDim b ON UPPER(a.Age) = UPPER(b.Age)
    GROUP BY b.Era)
    SELECT * FROM CTE_ERA
    ORDER BY avg_{column} DESC;
    """
    return handle_grouped_avg_data(query, "Era", f"avg_{column}")

# Grouped average routes for days/cost per well type
@app.route("/api/<column>_per_well_type", methods=["GET"])
@cache.cached(timeout=60)
def data_per_well_type(column: str) -> Response:
    if column not in ["days", "cost"]:
        abort(404, description="Invalid column")

    column_name = "Days_per_1000m" if column == "days" else "Cost_per_1000m"
    
    query = f"""
    WITH CTE_WELL_TYPE AS (
    SELECT b.Well_Type_Name, AVG(a.{column_name}) AS avg_{column}
    FROM WellsDataTable a
    LEFT JOIN WellTypeDim b ON UPPER(a.Well_Type) = UPPER(b.Well_Type)
    GROUP BY b.Well_Type_Name)
    SELECT * FROM CTE_WELL_TYPE
    ORDER BY avg_{column} DESC;
    """
    return handle_grouped_avg_data(query, "Well_Type", f"avg_{column}")

# Grouped average routes for days/cost per region
@app.route("/api/<column>_per_region", methods=["GET"])
@cache.cached(timeout=60)
def data_per_region(column: str) -> Response:
    if column not in ["days", "cost"]:
        abort(404, description="Invalid column")
    
    column_name = "Days_per_1000m" if column == "days" else "Cost_per_1000m"
    
    query = f"""
    WITH CTE_REGION AS (
    SELECT a.Region, AVG(a.{column_name}) AS avg_{column}
    FROM WellsDataTable a
    GROUP BY a.Region)
    SELECT * FROM CTE_REGION
    ORDER BY avg_{column} DESC;
    """
    return handle_grouped_avg_data(query, "Region", f"avg_{column}")

# Grouped average routes for days/cost per year
@app.route("/api/<column>_per_year", methods=["GET"])
@cache.cached(timeout=60)
def data_per_year(column: str) -> Response:
    if column not in ["days", "cost"]:
        abort(404, description="Invalid column")
    
    column_name = "Days_per_1000m" if column == "days" else "Cost_per_1000m"
    
    query = f"""
    SELECT a.Year, AVG(a.{column_name}) AS avg_{column}
    FROM WellsDataTable a
    GROUP BY a.Year;
    """
    return handle_grouped_avg_data(query, "Year", f"avg_{column}")

@app.route("/api/summary_stats", methods=["GET"])
@cache.cached(timeout=60)
def summary_stats() -> Response:
    query = """
    SELECT 
        SUM(Number_of_Wells) AS total_wells,
        AVG(Cost_per_1000m) AS avg_cost,
        AVG(Days_per_1000m) AS avg_days
    FROM WellsDataTable;
    """
    result = query_db(query)
    if result:
        total_wells, avg_cost, avg_days = result[0]
    else:
        total_wells, avg_cost, avg_days = 0, 0, 0
    
    return jsonify({
        "total_wells": total_wells,
        "avg_cost": avg_cost,
        "avg_days": avg_days
    })



###################################################################################
# Run the app
if __name__ == "__main__":
    import os
    debug_mode = os.getenv("FLASK_DEBUG", "false").lower() == "true"
    app.run(debug=debug_mode)

