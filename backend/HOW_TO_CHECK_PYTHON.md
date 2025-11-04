# Python Versiyasini Tekshirish

## Muhim Tushuncha

**Python REPL (Interactive Shell)** va **Terminal/Command Prompt** - bu ikki xil narsa!

### ❌ Noto'g'ri

Python REPL ichida (>>> prompt ko'rsatilganda):
```python
>>> python --version  # ❌ XATOLIK! Bu Python shell ichida
```

### ✅ To'g'ri

**Oddiy Terminal/Command Prompt** da:
```bash
python --version  # ✅ To'g'ri
```

---

## Python REPL'dan Chiqish

Agar siz Python shell ichida bo'lsangiz (>>> ko'rsatilgan):

1. **Windows**:
   - `exit()` yozing va Enter bosing
   - Yoki `Ctrl+Z` tugmalarini bosing va Enter bosing

2. **Linux/Mac**:
   - `exit()` yozing va Enter bosing
   - Yoki `Ctrl+D` tugmalarini bosing

---

## Python Versiyasini Tekshirish

### Variant 1: Batch fayl orqali (Oson)

1. `backend` papkasida `check_python.bat` faylini ikki marta bosib oching
2. Bu sizga Python versiyasini ko'rsatadi

### Variant 2: Terminal'da

1. **Yangi Command Prompt yoki PowerShell** oching (Python REPL emas!)
2. Quyidagi komandani yozing:
```bash
python --version
```

3. Agar Python topilsa, versiya ko'rsatiladi:
```
Python 3.11.0
```

### Variant 3: Python Shell ichida (agar u yerda bo'lsangiz)

Python REPL ichida bo'lsangiz, quyidagilarni yozing:
```python
>>> import sys
>>> print(sys.version)
```

Keyin `exit()` yozib chiqing.

---

## Python O'rnatilmagan Bo'lsa

Agar "Python was not found" xatosi chiqsa:

1. **Python yuklab oling:**
   - https://www.python.org/downloads/ ga kiring
   - "Download Python 3.11.x" tugmasini bosing

2. **O'rnating:**
   - Yuklab olingan `.exe` faylni ishga tushiring
   - **MUHIM:** "Add Python to PATH" ni belgilang ✅

3. **Tekshiring:**
   - Terminal'ni **yopib qayta oching**
   - `python --version` komandasini yozing

---

## Backend Ishga Tushirish

Python versiyasi ko'rsatilgandan keyin:

1. `backend` papkasida `start_backend_simple.bat` faylini ikki marta bosib oching
2. Backend avtomatik ishga tushadi

---

## Qisqa Yo'riqnoma

```
1. Python REPL'dan chiqing: exit() yoki Ctrl+Z
2. Yangi Terminal oching (Command Prompt yoki PowerShell)
3. python --version yozing
4. Agar Python topilsa, start_backend_simple.bat ni ishga tushiring
```

