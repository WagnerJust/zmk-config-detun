# 🚀 START HERE

## How to Launch the Keyboard Visualizer

### ⚡ Quick Launch (Mac/Linux)

```bash
./start.sh
```

Your browser will open automatically to the visualizer!

---

### 🐍 Alternative: Python Launcher

```bash
python3 start-server.py
```

---

## ⚠️ Important

**DO NOT** double-click `index.html` directly!

ES6 modules require a web server to work properly. Opening the file directly will cause CORS errors.

---

## 🎮 Once It's Running

1. **Click on orange modifier keys** (CTRL, SHIFT, ALT, GUI)
2. **See available key combinations** in the right panel
3. **Rotate the view** with left-click and drag
4. **Zoom** with mouse scroll

---

## ❓ Troubleshooting

### "Command not found" or "Permission denied"

```bash
# Make the script executable
chmod +x start.sh

# Then run it
./start.sh
```

### Python not found

Try one of these:
```bash
python3 start-server.py
# or
python start-server.py
```

If Python isn't installed:
- Mac: `brew install python3`
- Linux: `sudo apt install python3` or `sudo yum install python3`

### Port already in use

The launcher will automatically find an available port. Just run it again!

---

## 📚 More Information

- **QUICKSTART.md** - Quick start guide
- **README.md** - Complete documentation
- **DEVELOPER.md** - How to modify and extend

---

**Happy visualizing!** 🎹✨