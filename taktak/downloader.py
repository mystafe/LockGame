import os
import pathlib
import re
import urllib.parse
from typing import Optional

import requests


def is_valid_url(url: str) -> bool:
    try:
        parsed = urllib.parse.urlparse(url)
        return all([parsed.scheme in ('http', 'https'), parsed.netloc])
    except Exception:
        return False


def _filename_from_cd(content_disposition: str) -> Optional[str]:
    if not content_disposition:
        return None
    fname_match = re.findall('filename="?([^";]+)"?', content_disposition)
    if fname_match:
        return fname_match[0]
    return None


def get_filename_from_url(url: str, response: Optional[requests.Response] = None) -> str:
    if response is not None:
        cd = response.headers.get('content-disposition')
        fname = _filename_from_cd(cd) if cd else None
        if fname:
            return fname
    path = urllib.parse.urlparse(url).path
    name = os.path.basename(path)
    return name or 'downloaded.file'


def download_file(url: str, dest_dir: pathlib.Path) -> pathlib.Path:
    if not is_valid_url(url):
        raise ValueError('Invalid URL provided')
    dest_dir = pathlib.Path(dest_dir)
    dest_dir.mkdir(parents=True, exist_ok=True)
    with requests.get(url, stream=True) as resp:
        resp.raise_for_status()
        filename = get_filename_from_url(url, resp)
        filepath = dest_dir / filename
        with open(filepath, 'wb') as f:
            for chunk in resp.iter_content(chunk_size=8192):
                if chunk:
                    f.write(chunk)
    return filepath
