import unittest
from unittest import mock
import pathlib
from taktak import downloader


class TestDownloader(unittest.TestCase):
    def test_get_filename_from_url(self):
        url = 'https://example.com/path/to/file.txt'
        self.assertEqual(downloader.get_filename_from_url(url), 'file.txt')

    def test_get_filename_when_no_name(self):
        url = 'https://example.com/'
        self.assertEqual(downloader.get_filename_from_url(url), 'downloaded.file')

    def test_is_youtube_url(self):
        self.assertTrue(downloader.is_youtube_url('https://www.youtube.com/watch?v=dQw4w9WgXcQ'))
        self.assertFalse(downloader.is_youtube_url('https://example.com/video'))

    def test_youtube_download_uses_pytube(self):
        fake_stream = mock.Mock()
        fake_stream.default_filename = 'vid.mp4'
        fake_stream.download.return_value = None
        fake_yt = mock.Mock(return_value=mock.Mock(streams=mock.Mock(filter=mock.Mock(return_value=mock.Mock(order_by=mock.Mock(return_value=mock.Mock(desc=mock.Mock(return_value=mock.Mock(first=mock.Mock(return_value=fake_stream))))))))))
        with mock.patch('taktak.downloader.YouTube', fake_yt):
            path = downloader.download_file('https://youtu.be/test', pathlib.Path('tmp'))
        self.assertEqual(path.name, 'vid.mp4')
        fake_stream.download.assert_called_once()


if __name__ == '__main__':
    unittest.main()
