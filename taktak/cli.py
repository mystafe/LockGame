import argparse
import pathlib
from .downloader import download_file, is_valid_url


def main():
    parser = argparse.ArgumentParser(description='TakTak URL downloader')
    parser.add_argument('url', help='URL to download')
    parser.add_argument('-o', '--output', default='.', help='Output directory')
    args = parser.parse_args()

    url = args.url
    if not is_valid_url(url):
        parser.error('Invalid URL provided')

    dest = pathlib.Path(args.output)
    ans = input(f'Do you want to download {url}? [y/N] ')
    if ans.lower() != 'y':
        print('Download cancelled.')
        return

    try:
        filepath = download_file(url, dest)
        print(f'Saved to {filepath}')
    except Exception as exc:
        print(f'Error: {exc}')


if __name__ == '__main__':
    main()
