# Drag and Drop Card Game Implementation

This implementation adds drag and drop functionality to the card game, allowing players to drag cards from their hand and drop them in different zones.

## Features

- **Draggable Cards**: Cards in the player's hand can be dragged using pan gestures
- **Visual Feedback**: Cards scale up and rotate slightly when being dragged
- **Drop Zone Detection**: Automatic detection of drop zones (Center Pile and Player Hand)
- **Console Logging**: Messages are printed based on where cards are dropped

## Components

### DraggableCard
- Replaces the original PlayingCard for draggable functionality
- Uses react-native-gesture-handler for pan gestures
- Includes visual feedback during drag operations
- Supports both tap and drag gestures simultaneously

### Drop Zone Detection
- `dropZoneDetection.ts` utility for detecting drop zones
- Configurable drop zone areas for Center Pile and Player Hand
- Distance-based fallback detection when not directly in a zone

## Usage

1. **Drag a card**: Long press and drag any card from the player's hand
2. **Drop zones**:
   - **Center Pile**: Drop near the center of the screen to play a card
   - **Player Hand**: Drop near the bottom to return card to hand
3. **Console messages**:
   - "Trying to put card" - when dropped in center pile area
   - "Returning card to player hand" - when dropped in player hand area
   - Fallback messages when dropped between zones

## Technical Details

- Uses `react-native-gesture-handler` for gesture recognition
- Uses `react-native-reanimated` for smooth animations
- Drop zones are defined as rectangular areas with configurable positions
- Cards return to original position after drag ends
- Z-index management ensures dragged cards appear on top

## Future Enhancements

- More precise drop zone detection using component measurements
- Visual drop zone indicators
- Haptic feedback during drag operations
- Game logic integration for actual card playing
