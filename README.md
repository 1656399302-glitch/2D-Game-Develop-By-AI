# Arcane Machine Codex Workshop

交互式魔法机械图鉴工坊 (Arcane Machine Codex Workshop) - A fully-featured SVG-based magic machine editor with animation, codex collection, and export capabilities.

## Overview

This is an interactive SVG editor for creating and animating "magic machines" - combinations of modular components that can be connected, activated, and collected in a codex system.

## Setup

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Run tests
npm run test

# Build for production
npm run build
```

### Development

```bash
# Start dev server with hot reload
npm run dev

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

## Architecture

### Technology Stack

- **React 18** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool
- **Zustand** - State management
- **GSAP** - Animations
- **Vitest** - Testing

### Project Structure

```
src/
├── components/       # React components
│   ├── Editor/       # Canvas and editing tools
│   ├── Modules/      # SVG module components
│   ├── Codex/        # Collection system
│   └── ...
├── store/            # Zustand stores
├── types/            # TypeScript types
├── utils/            # Utility functions
└── __tests__/        # Test files
```

### State Management

The application uses Zustand for state management with multiple specialized stores:

- `useMachineStore` - Canvas state, modules, connections
- `useCodexStore` - Collection entries
- `useActivationStore` - Machine activation states

## Modules

The editor supports multiple module types organized by category:

### Core Modules
- **Core Furnace** - Central power source for machines
- **Ether Infusion Chamber** - Energy transformation

### Gear Modules
- **Gear** - Mechanical rotation component

### Energy Modules
- **Energy Pipe** - Energy transmission conduit
- **Amplifier Crystal** - Energy amplification
- **Lightning Conductor** - Electric energy handling
- **Fire Crystal** - Fire energy component

### Rune Modules
- **Rune Node** - Magical inscription point

### Faction Variants
Each module may have faction-specific variants for different magical affinities.

### Module Properties

Modules have configurable properties:
- Position (x, y)
- Rotation
- Scale
- Flip state
- Port configurations

## Connections

### Energy Path System

Modules can be connected via energy paths:

1. Select source module
2. Click on output port
3. Select target module
4. Click on input port
5. Connection is created with path animation

### Connection Rules

- Output ports connect to input ports only
- Duplicate connections are prevented
- Connections update dynamically when modules move

## Activation

### State Machine

Machines follow a state machine:

```
idle → charging → active → shutdown
  ↓        ↓         ↓
failure  overload   ↓
  ↓        ↓         ↓
  └────────┴─────────┴──→ idle
```

### Activation Effects

When a machine is activated:
1. Zoom animation focuses on machine
2. Modules animate in BFS traversal order
3. Energy paths show flow animation
4. Core pulses with energy
5. Gear components rotate
6. Rune nodes pulse with magical energy

### Failure Modes

- **Failure** - Red warning effects, broken energy flow
- **Overload** - Yellow energy overflow, unstable animation

## Codex

### Collection System

Every machine created can be saved to the Codex:

1. Create a machine on the canvas
2. Save with auto-generated or custom name
3. Attributes are calculated from composition
4. Entry is stored with unique Codex ID

### Entry Attributes

Each codex entry includes:
- Machine name
- Rarity (Common, Rare, Epic, Legendary)
- Stability rating
- Energy output type
- Faction affinity
- Module composition
- Connection diagram
- Timestamps

### Codex Browser

View, filter, and manage saved machines by:
- Rarity
- Faction
- Creation date
- Tags

## Export

### SVG Export

Export machines as scalable SVG files:
- Vector graphics for infinite scaling
- Preserves module positions and connections
- Optimized for web display

### PNG Export

Export as raster images:
- Multiple resolution options
- Background customization
- Transparent or themed backgrounds

### Poster Export

Create shareable codex cards:
- Machine illustration
- Attribute summary
- Rarity badge
- Decorative borders
- Social media optimized

## Random Generator

The Forge system generates random machines:

1. Select theme or let system choose
2. System creates valid machine structure
3. Attributes are calculated
4. Machine is placed on canvas

Themes include:
- Void energy
- Inferno fire
- Storm lightning
- Stellar cosmic
- Arcane magical
- Chaos unstable

## Factions

Six magical factions provide technology bonuses:

1. **Void** - Dark energy manipulation
2. **Inferno** - Fire mastery
3. **Storm** - Lightning control
4. **Stellar** - Cosmic energy
5. **Arcane** - Pure magical force
6. **Chaos** - Entropy and disorder

Each faction has:
- Technology tree
- Unlock bonuses
- Faction-specific module variants

## Keyboard Shortcuts

| Action | Shortcut |
|--------|----------|
| Delete | `Del` / `Backspace` |
| Undo | `Ctrl+Z` |
| Redo | `Ctrl+Y` / `Ctrl+Shift+Z` |
| Select All | `Ctrl+A` |
| Copy | `Ctrl+C` |
| Paste | `Ctrl+V` |
| Duplicate | `Ctrl+D` |
| Save to Codex | `Ctrl+S` |
| Export | `Ctrl+E` |
| Zoom In | `+` / `=` |
| Zoom Out | `-` |
| Reset View | `0` |
| Toggle Grid | `G` |

## Troubleshooting

### Common Issues

**Canvas not loading:**
- Check browser console for errors
- Ensure WebGL support (for advanced effects)

**Modules not connecting:**
- Verify ports are compatible (input to output)
- Check for existing duplicate connections

**Activation not working:**
- Machine must have at least one module
- Core furnace recommended for activation

**Export failing:**
- Clear browser cache
- Check file permissions

## Contributing

### Development Guidelines

1. Use TypeScript for all new code
2. Add tests for new functionality
3. Follow existing component patterns
4. Update documentation for API changes

### Testing

```bash
# Run all tests
npm run test

# Run specific test file
npx vitest run src/__tests__/specific.test.ts

# Run with UI
npm run test:ui
```

### Code Style

- 2-space indentation
- Single quotes for strings
- Trailing commas
- Descriptive variable names

## License

This project is proprietary software for the Arcane Machine Codex Workshop system.
