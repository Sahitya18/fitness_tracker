from flask import Flask, request, jsonify
from PIL import Image
import pytesseract
import base64
import io

app = Flask(__name__)

@app.route('/ocr', methods=['POST'])
def ocr():
    data = request.json
    image_data = base64.b64decode(data['imageBase64'])
    image = Image.open(io.BytesIO(image_data))
    text = pytesseract.image_to_string(image)
    return jsonify({"text": text})

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)
