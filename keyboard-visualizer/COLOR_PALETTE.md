# Color Palette Reference

## Available Colors

The keyboard visualizer uses a curated palette of 8 colors for key customization.

### Color Swatches

```
🔲 Black      #2c2c2c  (44, 44, 44)
🔲 Cream      #f5e6d3  (245, 230, 211)
🔲 Sky Blue   #87ceeb  (135, 206, 235)
🔲 Mint       #7dd3c0  (125, 211, 192)
🔲 Yellow     #f4e57e  (244, 229, 126)
🔲 Pink       #f5a3b5  (245, 163, 181)
🔲 Lavender   #b8a7d9  (184, 167, 217)
🔲 Purple     #7e6db5  (126, 109, 181)
```

### Color Details

#### Black (#2c2c2c)
- **Use Case**: Special keys, accents, high contrast
- **RGB**: 44, 44, 44
- **Hex**: 0x2c2c2c

#### Cream (#f5e6d3) - Default
- **Use Case**: Default key color, neutral base
- **RGB**: 245, 230, 211
- **Hex**: 0xf5e6d3

#### Sky Blue (#87ceeb)
- **Use Case**: Modifiers, function keys
- **RGB**: 135, 206, 235
- **Hex**: 0x87ceeb

#### Mint (#7dd3c0)
- **Use Case**: Navigation, arrows, special functions
- **RGB**: 125, 211, 192
- **Hex**: 0x7dd3c0

#### Yellow (#f4e57e)
- **Use Case**: Numbers, attention keys
- **RGB**: 244, 229, 126
- **Hex**: 0xf4e57e

#### Pink (#f5a3b5)
- **Use Case**: Layer switches, special modes
- **RGB**: 245, 163, 181
- **Hex**: 0xf5a3b5

#### Lavender (#b8a7d9)
- **Use Case**: Letters, alphas, main keys
- **RGB**: 184, 167, 217
- **Hex**: 0xb8a7d9

#### Purple (#7e6db5)
- **Use Case**: Secondary functions, symbols
- **RGB**: 126, 109, 181
- **Hex**: 0x7e6db5

## Design Philosophy

This palette was chosen to provide:
- **Sufficient contrast** for visibility
- **Harmonious colors** that work well together
- **Functional distinction** between key types
- **Aesthetic appeal** for a modern keyboard layout

## Color Combinations

Suggested combinations for different keyboard layouts:

### Minimal
- All keys: Cream
- Modifiers: Sky Blue
- Special: Black

### Pastel Theme
- Alphas: Cream
- Modifiers: Lavender
- Numbers: Yellow
- Special: Pink

### Cool Tones
- Alphas: Cream
- Modifiers: Sky Blue
- Navigation: Mint
- Layers: Purple

### High Contrast
- Alphas: Cream
- Modifiers: Black
- Numbers: Yellow
- Special: Pink

## Technical Implementation

Colors are stored as hexadecimal values in localStorage:
```javascript
{
  "layer:row:col": 0x87ceeb  // Example: Sky Blue
}
```

Default color for unpainted keys: `0xf5e6d3` (Cream)