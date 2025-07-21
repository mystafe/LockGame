from flask import Flask, request, render_template_string
import pathlib

from .downloader import download_file, is_valid_url

app = Flask(__name__)

HTML_FORM = '''
<!doctype html>
<title>TakTak Downloader</title>
<h1>Download a URL</h1>
<form method="post">
    URL: <input type="text" name="url" required><br>
    Output Directory: <input type="text" name="output" value="." required><br>
    <input type="submit" value="Download">
</form>
{% if message %}
<p>{{ message }}</p>
{% endif %}
'''


@app.route('/', methods=['GET', 'POST'])
def index():
    message = ''
    if request.method == 'POST':
        url = request.form.get('url', '')
        output = request.form.get('output', '.')
        if not is_valid_url(url):
            message = 'Invalid URL'
        else:
            try:
                path = download_file(url, pathlib.Path(output))
                message = f'Saved to {path}'
            except Exception as exc:
                message = f'Error: {exc}'
    return render_template_string(HTML_FORM, message=message)


if __name__ == '__main__':
    app.run()
