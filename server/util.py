import pickle,json
import numpy as np
import pandas as pd

def get_locations():
    return __locations

__locations = None
__data_columns= None
__model = None

def get_estimated_price(location, sqft, bath, bhk):
    
    try:
        loc_index = __data_columns.index(location)
    except:
        loc_index = -1
    x = np.zeros(len(__data_columns))
    x[0] = sqft
    x[1] = bath
    x[2] = bhk
    if loc_index >= 0:
        x[loc_index] = 1

    x_df = pd.DataFrame([x], columns=__data_columns)
    return round(__model.predict(x_df)[0], 2)

def load_saved_artifacts():
    print("Loading saved artifacts...")
    global __locations
    global __data_columns
    global __model
    with open("./artifacts/columns.json", "r") as f:
        __data_columns =json.load(f)["data_columns"]
        __locations = __data_columns[3:]

    with open("./artifacts/banglore_home_prices_model.pickle", "rb") as f:
        __model = pickle.load(f)
    

if (__name__ == "__main__"):
    pass
    