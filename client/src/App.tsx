import { useState, useEffect } from "react";
import "./App.css";

interface PredictResult {
  formatted: string;
  location: string;
  sqft: string;
  bhk: number;
  bath: number;
}

export default function App() {
  const [locations, setLocations] = useState<string[]>([]);
  const [location, setLocation] = useState<string>("");
  const [sqft, setSqft] = useState<string>("");
  const [bhk, setBhk] = useState<number | null>(null);
  const [bath, setBath] = useState<number | null>(null);
  const [result, setResult] = useState<PredictResult | null>(null);
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    fetch("http://127.0.0.1:5000/get_locations")
      .then(res => res.json())
      .then(data => setLocations(data.locations))
      .catch(() => setError("Could not load locations. Is Flask running?"));
  }, []);

  async function predict() {
    setError("");
    setResult(null);

    if (!location) return setError("Please select a location.");
    if (!sqft || Number(sqft) <= 0) return setError("Please enter a valid area in sqft.");
    if (!bhk) return setError("Please select number of BHK.");
    if (!bath) return setError("Please select number of bathrooms.");

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("location", location);
      formData.append("total_sqft", sqft);
      formData.append("bhk", String(bhk));
      formData.append("bath", String(bath));

      const res = await fetch("http://127.0.0.1:5000/predict_home_price", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) throw new Error(`Server error: ${res.status}`);
      const data = await res.json();
      const price = parseFloat(data.estimated_price);
      const formatted = price >= 100
        ? `₹ ${(price / 100).toFixed(2)} Cr`
        : `₹ ${price.toFixed(2)} Lakh`;

      setResult({ formatted, location, sqft, bhk, bath });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="wrapper">
      <div className="header">
        <h1>Home Price<br />Predictor</h1>
        <p className="subtitle">Bengaluru real estate estimates in seconds</p>
      </div>

      <div className="card">
        <div className="form-grid">

          <div className="form-group full">
            <label>Location</label>
            <div className="select-wrap">
              <select value={location} onChange={e => setLocation(e.target.value)}>
                <option value="" disabled>Select a location</option>
                {locations.map(loc => (
                  <option key={loc} value={loc}>{loc}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-group full">
            <label>Total Area (sqft)</label>
            <input
              type="number"
              placeholder="e.g. 1200"
              value={sqft}
              onChange={e => setSqft(e.target.value)}
              min="100"
              max="10000"
            />
          </div>

          <div className="form-group">
            <label>BHK</label>
            <div className="pill-group">
              {[1, 2, 3, 4, 5].map(n => (
                <button
                  key={n}
                  className={`pill ${bhk === n ? "active" : ""}`}
                  onClick={() => setBhk(n)}
                >
                  {n}
                </button>
              ))}
            </div>
          </div>

          <div className="form-group">
            <label>Bathrooms</label>
            <div className="pill-group">
              {[1, 2, 3, 4, 5].map(n => (
                <button
                  key={n}
                  className={`pill ${bath === n ? "active" : ""}`}
                  onClick={() => setBath(n)}
                >
                  {n}
                </button>
              ))}
            </div>
          </div>

        </div>

        <div className="divider"></div>

        <button className={`btn ${loading ? "loading" : ""}`} onClick={predict} disabled={loading}>
          <div className="btn-inner">
            {loading && <div className="spinner"></div>}
            <span className="btn-text">{loading ? "Predicting..." : "Predict Price"}</span>
          </div>
        </button>

        {error && <div className="error-msg show">{error}</div>}

        {result && (
          <div className="result show">
            <div className="result-inner">
              <div className="result-label">Estimated Price</div>
              <div className="result-price">{result.formatted}</div>
              <div className="result-sub">
                {result.location} · {result.sqft} sqft · {result.bhk} BHK · {result.bath} Bath
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}