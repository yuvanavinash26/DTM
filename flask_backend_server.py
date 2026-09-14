#!/usr/bin/env python3
"""
DTM Smart Attendance - Live BLE Flask Backend Gateway
------------------------------------------------------
Serves real-time BLE detection telemetry on:
  http://localhost:8000/api/attendance

Target Student: Yuvan Avinash
Register No:    RA2511003020041
BLE Beacon ID:  DTM_BLE_YUVAN (MAC: 7B:E0:C6:3A:DD:BE)

Usage:
  1. Install dependencies:
       pip install flask flask-cors
  2. Start the server:
       python flask_backend_server.py
"""

import sys
import time
import random
from datetime import datetime

try:
    from flask import Flask, jsonify, request
    from flask_cors import CORS
except ImportError:
    print("\n[ERROR] Required Python packages missing.")
    print("Please install them using: pip install flask flask-cors\n")
    sys.exit(1)

app = Flask(__name__)
# Enable CORS for all routes and origins
CORS(app, resources={r"/api/*": {"origins": "*"}})

# State for live BLE presence simulation
ble_state = {
    "student": "Yuvan Avinash",
    "student_id": "RA2511003020041",
    "phone_address": "7B:E0:C6:3A:DD:BE",
    "bluetooth": "PRESENT",
    "attendance": "PRESENT",
    "base_rssi": -54,
    "last_seen": int(time.time()),
}


@app.route("/api/attendance", methods=["GET", "OPTIONS"])
def get_attendance():
    """
    Primary endpoint polled by the DTM React frontend every 2 seconds.
    Returns live BLE detection status, dynamic RSSI proximity, and timestamp.
    """
    if request.method == "OPTIONS":
        return "", 200

    # Simulate realistic BLE signal jitter (+/- 4 dBm)
    current_rssi = ble_state["base_rssi"] + random.randint(-4, 4)
    now_epoch = int(time.time())

    payload = {
        "student": ble_state["student"],
        "student_id": ble_state["student_id"],
        "phone_address": ble_state["phone_address"],
        "bluetooth": ble_state["bluetooth"],
        "attendance": ble_state["attendance"],
        "rssi": current_rssi if ble_state["bluetooth"] == "PRESENT" else None,
        "last_seen": now_epoch,
        "server_time": datetime.now().strftime("%I:%M:%S %p"),
        "gateway": "DTM-ESP32-01",
        "room": "Hall 304",
    }
    return jsonify(payload), 200


@app.route("/api/attendance/toggle", methods=["POST", "GET"])
def toggle_ble():
    """
    Utility endpoint to test switching Yuvan between PRESENT and ABSENT.
    Usage:
      curl http://localhost:8000/api/attendance/toggle
    """
    if ble_state["bluetooth"] == "PRESENT":
        ble_state["bluetooth"] = "ABSENT"
        ble_state["attendance"] = "PENDING"
    else:
        ble_state["bluetooth"] = "PRESENT"
        ble_state["attendance"] = "PRESENT"
        ble_state["last_seen"] = int(time.time())

    return jsonify({
        "status": "success",
        "bluetooth": ble_state["bluetooth"],
        "attendance": ble_state["attendance"],
        "student": ble_state["student"],
        "student_id": ble_state["student_id"],
    }), 200


@app.route("/api/health", methods=["GET"])
def health_check():
    """Health check endpoint"""
    return jsonify({
        "status": "online",
        "service": "DTM BLE Attendance Gateway",
        "port": 8000,
        "student": ble_state["student"],
        "roll_number": ble_state["student_id"]
    }), 200


if __name__ == "__main__":
    print("\n" + "=" * 65)
    print("  DTM SMART ATTENDANCE - FLASK BLE BACKEND GATEWAY")
    print("=" * 65)
    print(f"  Target Student:  {ble_state['student']}")
    print(f"  Roll Number:     {ble_state['student_id']}")
    print(f"  Phone BLE MAC:   {ble_state['phone_address']}")
    print(f"  Polling Endpoint: http://localhost:8000/api/attendance")
    print(f"  Toggle Presence:  http://localhost:8000/api/attendance/toggle")
    print("=" * 65)
    print("  Serving live BLE telemetry on port 8000 with CORS enabled...\n")
    
    app.run(host="0.0.0.0", port=8000, debug=False)
