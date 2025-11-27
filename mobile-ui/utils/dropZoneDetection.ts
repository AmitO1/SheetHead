import { Dimensions } from "react-native"

const { width, height } = Dimensions.get("window")

export interface DropZone {
  id: string
  x: number
  y: number
  width: number
  height: number
}

export interface DropZoneDetection {
  isInCenterPile: boolean
  isInPlayerHand: boolean
  closestZone?: string
}

export function detectDropZone(
  dropX: number,
  dropY: number,
  centerPileZone: DropZone,
  playerHandZone: DropZone
): DropZoneDetection {
  const isInCenterPile = 
    dropX >= centerPileZone.x &&
    dropX <= centerPileZone.x + centerPileZone.width &&
    dropY >= centerPileZone.y &&
    dropY <= centerPileZone.y + centerPileZone.height

  const isInPlayerHand = 
    dropX >= playerHandZone.x &&
    dropX <= playerHandZone.x + playerHandZone.width &&
    dropY >= playerHandZone.y &&
    dropY <= playerHandZone.y + playerHandZone.height

  // Calculate distances to determine closest zone
  const centerPileDistance = Math.sqrt(
    Math.pow(dropX - (centerPileZone.x + centerPileZone.width / 2), 2) +
    Math.pow(dropY - (centerPileZone.y + centerPileZone.height / 2), 2)
  )

  const playerHandDistance = Math.sqrt(
    Math.pow(dropX - (playerHandZone.x + playerHandZone.width / 2), 2) +
    Math.pow(dropY - (playerHandZone.y + playerHandZone.height / 2), 2)
  )

  const closestZone = centerPileDistance < playerHandDistance ? "centerPile" : "playerHand"

  return {
    isInCenterPile,
    isInPlayerHand,
    closestZone,
  }
}

export function getDefaultDropZones() {
  // These are approximate positions based on the GameBoard layout
  // In a real implementation, you'd measure the actual component positions
  const centerPileZone: DropZone = {
    id: "centerPile",
    x: width * 0.3, // Approximate center area
    y: height * 0.3,
    width: width * 0.4,
    height: height * 0.2,
  }

  const playerHandZone: DropZone = {
    id: "playerHand",
    x: width * 0.1, // Bottom area
    y: height * 0.7,
    width: width * 0.8,
    height: height * 0.25,
  }

  return {
    centerPileZone,
    playerHandZone,
  }
}
