# TakTak

TakTak, komut satırından herhangi bir URL'i indirmenizi sağlayan basit bir Python aracıdır.

## Kurulum

1. Depoyu klonlayın ve dizine girin.
2. Gerekli paketleri kurun:

```bash
pip install -r requirements.txt
```

## Kullanım

```bash
python -m taktak <URL> [-o cikti_klasoru]
```

Örnek:

```bash
python -m taktak https://example.com/dosya.zip -o indirmeler
```

Komut çalıştığında indirme onayı istenir. `y` diyerek indirilen dosyayı belirtilen dizine kaydedebilirsiniz.

## Testler

```bash
python -m unittest discover -s tests
```

## Web Arayuzu

Basit bir web formu ile dosya indirmek icin:

```bash
python -m taktak.webapp
```

Uygulama calistiginda tarayicinizdan `http://localhost:5000` adresini ziyaret
ederek URL ve cikti klasorunu belirtebilirsiniz.
