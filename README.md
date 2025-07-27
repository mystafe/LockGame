# minigames

Bu proje React ile geliştirilmiş iki farklı oyun içerir: sayısal kilit tahmini ve Sudoku. Kilit oyununda sistem rastgele hanelerden oluşan bir şifre belirler. Oyuncu rakamları yukarı/aşağı okları ile değiştirerek tahmin yapar. Toplam deneme hakkı seçilen zorluğa göre değişir.

Sudoku oyununda üç zorluk seviyesi bulunur. Kolay seviyede 5x5 karelik mini bir Sudoku sunulur ve üç ipucu verilir. Orta seviyede 9x9 standart Sudoku daha fazla açık sayıyla gelir ve yine üç ipucu sağlanır. Zor seviyede 9x9 Sudoku daha az açık sayı içerir, üç yanılma hakkı ve tek ipucu vardır.

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

