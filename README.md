# Kilit Tahmin Oyunu

Bu proje, basit bir sayısal kilit tahmin oyununu React ile sunar. Oyun açıldığında sistem rastgele beş haneli bir şifre belirler. Oyuncu rakamları yukarı/aşağı okları ile değiştirerek tahmin yapar. Toplam deneme hakkı 10'dur.

Her tahmin sonrası sonuçlar renklerle gösterilir:

- **Yeşil:** Rakam doğru ve doğru sırada.
- **Sarı:** Rakam doğru fakat yanlış sırada.
- **Kırmızı:** Rakam şifre içinde bulunmuyor.

Tüm rakamlar doğru tahmin edildiğinde veya haklar bittiğinde oyun sona erer ve yeniden başlatma butonu görünür.

## Kurulum

1. Depoyu klonlayın ve proje dizinine girin.
2. Gerekli paketleri yüklemek için aşağıdaki komutları çalıştırın:

```bash
npm install
```

## Geliştirme Sunucusu

Aşağıdaki komut ile yerel geliştirme sunucusunu başlatabilirsiniz:

```bash
npm run dev
```

Sunucu çalıştığında tarayıcınızdan `http://localhost:5173` adresini ziyaret ederek oyunu oynayabilirsiniz.

