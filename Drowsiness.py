import tkinter as tk
from tkinter import messagebox
from PIL import Image, ImageTk
import sys
import os
import json
import requests
import uuid
import platform
import subprocess

# === Import run.py content ===
try:
    import run  # Your logic must be inside run.main()
except Exception as e:
    print(f"Error importing run.py: {e}")


# === Load Saved productKey ===
SAVED_KEY_FILE = "saved_product_key.json"
saved_product_key = ""
try:
    with open(SAVED_KEY_FILE, "r") as f:
        saved_product_key = json.load(f).get("productKey", "")
except:
    pass

def get_mac_unix():
    print("Getting MAC for Unix-based OS")
    result = subprocess.check_output("ifconfig", shell=True).decode(errors='ignore')
    for line in result.split('\n'):
        if 'ether' in line:
            return line.strip().split()[1]
    raise Exception("MAC address not found in ifconfig output.")

    

def get_mac_windows():
    print("Getting MAC for Windows OS")
    result = subprocess.check_output("getmac", shell=True).decode(errors='ignore')
    for line in result.splitlines():
        parts = line.strip().split()
        if parts and '-' in parts[0]:  # Typically MAC addresses look like XX-XX-XX-XX-XX-XX
            return parts[0]
    raise Exception("MAC address not found in getmac output.")



def get_actual_mac():
    system = platform.system()
    if system == "Windows":
        return get_mac_windows()
    else:
        return get_mac_unix()


# === Start Application Button ===
def run_cmd():
    try:
        product_key = product_key_var.get().strip()
        if not product_key:
            messagebox.showerror("Input Error", "Please enter a Product Key.")
            return

        print(product_key)

        # Save productKey permanently
        with open(SAVED_KEY_FILE, "w") as f:
            json.dump({"productKey": product_key}, f)

        # Get MAC address
        mac = get_actual_mac()
        print(mac)
        # Prepare payload
        payload = {
            "productKey": product_key,
            "mac": mac
        }
        print(payload)
        # Send POST request

        params = {
            "productKey": product_key,
            "mac": mac
        }
        response = requests.get("http://localhost:8080/verifyPurchase", params=params)
        print(response)
        if response.status_code != 200:
            messagebox.showerror("API Error", f"API call failed: {response.status_code}")
            return

        result = response.json()
        
        if not result:
            messagebox.showwarning("Access Denied", "API validation failed. Application cannot start.")
            return
        else:
            messagebox.showinfo("Access Granted", "API validation succeeded. Application will start.")
            
        try:
            os.remove(SAVED_KEY_FILE)
        except Exception as del_err:
            print(f"Warning: Could not delete {SAVED_KEY_FILE}: {del_err}")
        #run.main()

    except Exception as e:
        messagebox.showerror("Error", f"Failed to start application:\n{e}")

# === Stop Application Button ===
def press_q():
    confirm = messagebox.askyesno("Exit Confirmation", "Are you sure you want to exit?")
    if confirm:
        root.destroy()
        sys.exit()

# === Resource Helper for PyInstaller ===
def resource_path(relative_path):
    try:
        base_path = sys._MEIPASS
    except Exception:
        base_path = os.path.abspath(".")
    return os.path.join(base_path, relative_path)

# === Main GUI Setup ===
root = tk.Tk()
root.title("Drowsiness Detection GUI")
root.geometry("500x500")
root.resizable(False, False)

# === Background Image ===
try:
    bg_image = Image.open(resource_path("background.jpg"))
    bg_photo = ImageTk.PhotoImage(bg_image.resize((500, 500)))
    background_label = tk.Label(root, image=bg_photo)
    background_label.place(x=0, y=0, relwidth=1, relheight=1)
except:
    tk.Label(root, text="Background image not found.").pack()

# === Center Image ===
try:
    image = Image.open(resource_path("image.png"))
    image = image.resize((200, 200))
    photo = ImageTk.PhotoImage(image)
    image_label = tk.Label(root, image=photo, bd=0)
    image_label.image = photo
    image_label.pack(pady=20)
except:
    tk.Label(root, text="image.png not found.").pack()

# === Product Key Input Field ===
product_key_label = tk.Label(root, text="Enter Product Key:", font=("Helvetica", 12))
product_key_label.pack(pady=5)

product_key_var = tk.StringVar(value=saved_product_key)
product_key_entry = tk.Entry(root, textvariable=product_key_var, font=("Helvetica", 12), width=30)
product_key_entry.pack(pady=5)

# === Buttons ===
start_btn = tk.Button(
    root, text="Start Application", command=run_cmd,
    bg="#10FD18",
    font=("Helvetica", 12, "bold"),
    width=25, height=2, borderwidth=0
)
start_btn.pack(pady=10)

stop_btn = tk.Button(
    root, text="Stop Application", command=press_q,
    bg="#F71000",
    font=("Helvetica", 12, "bold"),
    width=25, height=2, borderwidth=0
)
stop_btn.pack(pady=10)

root.mainloop()
