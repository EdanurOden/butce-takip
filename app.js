// veriler
let islemler = [];
let aktifFiltre = 'hepsi';

// sayfa yuklenince calisir
window.onload = function() {
    verileriYukle();
    bugunTarihiAyarla();
    sayfayiGuncelle();
};

function bugunTarihiAyarla() {
    let bugun = new Date();
    let yil = bugun.getFullYear();
    let ay = String(bugun.getMonth() + 1).padStart(2, '0');
    let gun = String(bugun.getDate()).padStart(2, '0');
    document.getElementById('tarih').value = `${yil}-${ay}-${gun}`;
}

// localstoragedan oku
function verileriYukle() {
    let kaydedilmis = localStorage.getItem('paraTakip');
    if (kaydedilmis) {
        islemler = JSON.parse(kaydedilmis);
    }
}

// localstorageye kaydet
function verileriKaydet() {
    localStorage.setItem('paraTakip', JSON.stringify(islemler));
}

// yeni islem ekle
function islemEkle() {
    let tur = document.getElementById('tur').value;
    let kategori = document.getElementById('kategori').value;
    let miktarStr = document.getElementById('miktar').value;
    let tarih = document.getElementById('tarih').value;
    let aciklama = document.getElementById('aciklama').value;

    // virgul nokta donusumu
    if (miktarStr.includes(',')) {
        miktarStr = miktarStr.replace(',', '.');
    }
    
    let miktar = parseFloat(miktarStr);

    if (!miktarStr || isNaN(miktar) || miktar <= 0) {
        alert('Lütfen geçerli bir miktar gir');
        return;
    }

    if (!tarih) {
        alert('Tarih seç');
        return;
    }

    let yeniIslem = {
        id: Date.now(),
        tur: tur,
        kategori: kategori,
        miktar: miktar,
        tarih: tarih,
        aciklama: aciklama
    };

    islemler.push(yeniIslem);
    verileriKaydet();
    sayfayiGuncelle();

    // formu temizle
    document.getElementById('miktar').value = '';
    document.getElementById('aciklama').value = '';
    bugunTarihiAyarla();
}

// filtre degistir
function filtreUygula(tip, buton) {
    aktifFiltre = tip;
    
    // butonlari guncelle
    let tumButonlar = document.querySelectorAll('.filtre');
    tumButonlar.forEach(b => b.classList.remove('active'));
    buton.classList.add('active');
    
    islemleriGoster();
}

// islem sil
function sil(id) {
    if (confirm('Silmek istediğinden emin misin?')) {
        islemler = islemler.filter(item => item.id !== id);
        verileriKaydet();
        sayfayiGuncelle();
    }
}

// sayfa guncelle
function sayfayiGuncelle() {
    ozethesapla();
    islemleriGoster();
}

// ozet kartlarini hesapla
function ozethesapla() {
    let toplamGelir = 0;
    let toplamGider = 0;

    for (let i = 0; i < islemler.length; i++) {
        if (islemler[i].tur === 'gelir') {
            toplamGelir += islemler[i].miktar;
        } else {
            toplamGider += islemler[i].miktar;
        }
    }

    let kalan = toplamGelir - toplamGider;

    document.getElementById('toplamGelir').textContent = '₺' + toplamGelir.toFixed(2);
    document.getElementById('toplamGider').textContent = '₺' + toplamGider.toFixed(2);
    document.getElementById('bakiye').textContent = '₺' + kalan.toFixed(2);
}

// islemleri ekrana bas
function islemleriGoster() {
    let liste = document.getElementById('islemler');
    
    let filtrelenmis = islemler;
    if (aktifFiltre !== 'hepsi') {
        filtrelenmis = [];
        for (let i = 0; i < islemler.length; i++) {
            if (islemler[i].tur === aktifFiltre) {
                filtrelenmis.push(islemler[i]);
            }
        }
    }

    // tarihe gore sirala (yeniden eskiye)
    filtrelenmis.sort(function(a, b) {
        return new Date(b.tarih) - new Date(a.tarih);
    });

    if (filtrelenmis.length === 0) {
        liste.innerHTML = '<div class="bos-mesaj"><p style="font-size:50px;">📊</p><h3>Henüz işlem yok</h3></div>';
        return;
    }

    let html = '';
    for (let i = 0; i < filtrelenmis.length; i++) {
        let item = filtrelenmis[i];
        let ikonClass = item.tur === 'gelir' ? 'gelir-ikon' : 'gider-ikon';
        let turarClass = item.tur === 'gelir' ? 'gelir-tutar' : 'gider-tutar';
        let isaret = item.tur === 'gelir' ? '+' : '-';
        let tarihText = tarihFormat(item.tarih);
        
        html += `
            <div class="islem-item">
                <div class="ikon ${ikonClass}">
                    ${item.tur === 'gelir' ? '↑' : '↓'}
                </div>
                <div class="detay">
                    <h4>${item.kategori}</h4>
                    <p>${tarihText}${item.aciklama ? ' • ' + item.aciklama : ''}</p>
                </div>
                <div class="islem-tutar ${turarClass}">
                    ${isaret}₺${item.miktar.toFixed(2)}
                </div>
                <button class="sil-btn" onclick="sil(${item.id})">Sil</button>
            </div>
        `;
    }

    liste.innerHTML = html;
}

// tarih formatla
function tarihFormat(tarihStr) {
    let tarih = new Date(tarihStr + 'T00:00:00');
    let bugun = new Date();
    bugun.setHours(0, 0, 0, 0);
    
    let dun = new Date(bugun);
    dun.setDate(dun.getDate() - 1);

    tarih.setHours(0, 0, 0, 0);

    if (tarih.getTime() === bugun.getTime()) {
        return 'Bugün';
    } else if (tarih.getTime() === dun.getTime()) {
        return 'Dün';
    } else {
        let aylar = ['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran', 
                     'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'];
        return tarih.getDate() + ' ' + aylar[tarih.getMonth()] + ' ' + tarih.getFullYear();

    }
}