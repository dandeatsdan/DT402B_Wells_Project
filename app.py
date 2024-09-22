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

# Generalized function for single-value API responses
def handle_well_data(query: str, response_key: str, formatter=None) -> Response:
    result = query_db(query)
    value = result[0][0] if result and result[0][0] is not None else 0
    if formatter:
        value = formatter(value)
    return jsonify({response_key: value})

# Generalized function for routes returning grouped averages
def handle_grouped_avg_data(query: str, key1: str, key2: str) -> Response:
    data = format_query_response(query, key1, key2)
    return jsonify(data)

###################################################################################
# Routes
@app.route("/")
def index() -> str:
    return render_template("dashboard.html")

# Total wells route (Single value)
@app.route("/api/total_wells", methods=["GET"])
@cache.cached(timeout=60)
def total_wells() -> Response:
    query = "SELECT COUNT(Number_of_Wells) FROM WellsDataTable;"
    return handle_well_data(query, "total_wells")

# Average days per 1000m route (Single value)
@app.route("/api/avg_days", methods=["GET"])
@cache.cached(timeout=60)
def avg_days() -> Response:
    query = "SELECT AVG(Days_per_1000m) FROM WellsDataTable;"
    return handle_well_data(query, "avg_days", formatter=lambda x: round(x, 1))

# Grouped average routes (Using the same handler for all grouped averages)
@app.route("/api/days_per_era", methods=["GET"])
@cache.cached(timeout=60)
def days_per_era() -> Response:
    query = """
    WITH CTE_ERA AS (
    SELECT b.Era, AVG(a.Days_per_1000m) AS avg_days
    FROM WellsDataTable a
    LEFT JOIN AgeDim b ON UPPER(a.Age) = UPPER(b.Age)
    GROUP BY b.Era)
    SELECT * FROM CTE_ERA
    ORDER BY avg_days DESC;
    """
    return handle_grouped_avg_data(query, "Era", "avg_days")

@app.route("/api/days_per_well_type", methods=["GET"])
@cache.cached(timeout=60)
def days_per_well_type() -> Response:
    query = """
    WITH CTE_WELL_TYPE AS (
    SELECT b.Well_Type_Name, AVG(a.Days_per_1000m) AS avg_days
    FROM WellsDataTable a
    LEFT JOIN WellTypeDim b ON UPPER(a.Well_Type) = UPPER(b.Well_Type)
    GROUP BY b.Well_Type_Name)
    SELECT * FROM CTE_WELL_TYPE
    ORDER BY avg_days DESC;
    """
    return handle_grouped_avg_data(query, "Well_Type", "avg_days")

@app.route("/api/days_per_region", methods=["GET"])
@cache.cached(timeout=60)
def days_per_region() -> Response:
    query = """
    WITH CTE_REGION AS (
    SELECT a.Region, AVG(a.Days_per_1000m) AS avg_days
    FROM WellsDataTable a
    GROUP BY a.Region)
    SELECT * FROM CTE_REGION
    ORDER BY avg_days DESC;
    """
    return handle_grouped_avg_data(query, "Region", "avg_days")

@app.route("/api/days_per_year", methods=["GET"])
@cache.cached(timeout=60)
def days_per_year() -> Response:
    query = """
    SELECT a.Year, AVG(a.Days_per_1000m) AS avg_days
    FROM WellsDataTable a
    GROUP BY a.Year;
    """
    return handle_grouped_avg_data(query, "Year", "avg_days")

###################################################################################
# Run the app
if __name__ == "__main__":
    import os
    debug_mode = os.getenv("FLASK_DEBUG", "false").lower() == "true"
    app.run(debug=debug_mode)
