import unittest
from taktak.downloader import get_filename_from_url


class TestDownloader(unittest.TestCase):
    def test_get_filename_from_url(self):
        url = 'https://example.com/path/to/file.txt'
        self.assertEqual(get_filename_from_url(url), 'file.txt')

    def test_get_filename_when_no_name(self):
        url = 'https://example.com/'
        self.assertEqual(get_filename_from_url(url), 'downloaded.file')


if __name__ == '__main__':
    unittest.main()
