import unittest
from app import app

# List of API routes with their expected keys
API_LIST = [
    {"endpoint": "api/cost_per_era", "keys": ["Era", "avg_cost"]},
    {"endpoint": "api/cost_per_region", "keys": ["Region", "avg_cost"]},
    {"endpoint": "api/cost_per_well_type", "keys": ["Well_Type", "avg_cost"]},
    {"endpoint": "api/cost_per_year", "keys": ["Year", "avg_cost"]},
    {"endpoint": "api/days_per_era", "keys": ["Era", "avg_days"]},
    {"endpoint": "api/days_per_region", "keys": ["Region", "avg_days"]},
    {"endpoint": "api/days_per_well_type", "keys": ["Well_Type", "avg_days"]},
    {"endpoint": "api/days_per_year", "keys": ["Year", "avg_days"]},
]

class TestApiEndpoints(unittest.TestCase):
    def setUp(self):
        self.app = app.test_client()
        self.app.testing = True

    def test_all_endpoints(self):
        results = []
        
        for api in API_LIST:
            endpoint = f"/{api['endpoint']}"  # Add leading slash
            expected_keys = api["keys"]
            
            try:
                # Make the GET request
                response = self.app.get(endpoint)

                # Test the response status
                if response.status_code != 200:
                    results.append(f"{endpoint}: FAILED - Status code {response.status_code}")
                    continue

                # Test if response is JSON
                if not response.is_json:
                    results.append(f"{endpoint}: FAILED - Response is not JSON")
                    continue

                # Check for expected keys in the response
                missing_keys = [key for key in expected_keys if key not in response.json]
                if missing_keys:
                    results.append(f"{endpoint}: FAILED - Missing keys {missing_keys}")
                    continue

                # Check if the keys have the correct data types
                if "avg_cost" in expected_keys or "avg_days" in expected_keys:
                    data_key = "avg_cost" if "avg_cost" in expected_keys else "avg_days"
                    if not all(isinstance(x, (float, int)) for x in response.json[data_key]):
                        results.append(f"{endpoint}: FAILED - {data_key} contains invalid data types")
                        continue

                # If all checks pass
                results.append(f"{endpoint}: PASSED")
            except Exception as e:
                # Handle any unexpected errors and continue
                results.append(f"{endpoint}: FAILED - Exception {str(e)}")
        
        # Print the results in the command line
        print("\nTest Results:")
        for result in results:
            print(result)

if __name__ == "__main__":
    unittest.main()
