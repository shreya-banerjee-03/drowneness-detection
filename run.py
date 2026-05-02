import numpy as np
import torch
import cv2
import os
import time
from playsound import playsound
import threading

# Function to play sound in background
def play_sound_loop():
    while sound_flag["playing"]:
        playsound('alert2.wav') 

# Shared flag to control sound loop
sound_flag = {"playing": False}
sound_thread = None

def main():
    model = torch.hub.load('ultralytics/yolov5', 'custom',
                           path='runs/train/exp36/weights/last.pt', force_reload=True)

    cap = cv2.VideoCapture(0)
    drowsy_count = 0
    threshold = 15

    global sound_thread

    while cap.isOpened():
        ret, frame = cap.read()
        if not ret:
            break

        results = model(frame)
        labels = results.pandas().xyxy[0]['name'].tolist()

        # Show annotated frame
        cv2.imshow('YOLO', np.squeeze(results.render()))

        # Drowsiness logic
        if 'drowsy' in labels:
            drowsy_count += 1
        else:
            drowsy_count = 0
            # Stop sound when awake frame is detected
            if sound_flag["playing"]:
                sound_flag["playing"] = False
                if sound_thread is not None:
                    sound_thread.join()
                    sound_thread = None

        # Start playing alert sound after 3 drowsy frames
        if drowsy_count >= threshold and not sound_flag["playing"]:
            sound_flag["playing"] = True
            sound_thread = threading.Thread(target=play_sound_loop)
            sound_thread.start()

        # Exit key: q or ESC
        key = cv2.waitKey(1) & 0xFF
        if key == ord('q') or key == 27:
            break

    # Cleanup
    cap.release()
    cv2.destroyAllWindows()
    sound_flag["playing"] = False
    if sound_thread is not None:
        sound_thread.join()
#if __name__ == "__main__":
#   main()