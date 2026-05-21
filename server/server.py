from flask import Flask, jsonify, request
from flask_cors import CORS
import util

app = Flask(__name__)
CORS(app)

@app.route('/get_locations')
def get_locations():
    util.load_saved_artifacts()
    response = jsonify({
        "locations": util.get_locations()
    })
    return response

@app.route('/predict_home_price', methods=['POST'])
def predict_home_price():
    total_sqft = float(request.form['total_sqft'])
    location = request.form['location']
    bhk = int(request.form['bhk'])
    bath = int(request.form['bath'])
    print(location, total_sqft, bath, bhk)
    return {"estimated_price": util.get_estimated_price(location, total_sqft, bath, bhk)}

if (__name__ == "__main__"):
    print("Starting Python Flask Server for Home Price Prediction")
    util.load_saved_artifacts()
    app.run()
