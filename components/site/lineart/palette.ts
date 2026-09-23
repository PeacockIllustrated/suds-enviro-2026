/**
 * Colours and line weights for the line-art scenery kit.
 *
 * The look is an isometric architectural illustration: white or very pale
 * fills, thin site-blue ink, pale blue glazing, green planting, charcoal
 * surfacing and a few restrained accents (the red awning stripe, the
 * SuDS green). Keep new colours to this list so every scene stays one
 * drawing.
 */

export const LA = {
  // paper and ink
  paper: '#ffffff',
  paperWarm: '#fbfaf7',
  paperCool: '#f4f8fb',
  ink: '#1d80b9',
  inkDark: '#005576',
  inkSoft: '#7fb6d8',
  // glazing
  glass: '#cfe8f7',
  glassDeep: '#b5dbf1',
  glassInk: '#4f9ccb',
  glint: '#ffffff',
  // surfaces
  ground: '#f1f4f6',
  paving: '#eef2f5',
  pavingInk: '#b9cad6',
  asphalt: '#3a3a3c',
  asphaltLight: '#57585b',
  asphaltInk: '#232325',
  marking: '#ffffff',
  markingYellow: '#f2c94c',
  concrete: '#e9eef2',
  metal: '#dfe6eb',
  metalDark: '#6d7a84',
  // roofs and timber
  roof: '#eef5fa',
  roofInk: '#3b86b8',
  slate: '#dce8f0',
  timber: '#f1e2c8',
  timberInk: '#a07a4c',
  // planting
  grass: '#d6edcf',
  grassInk: '#54b54d',
  hedge: '#a9d99d',
  hedgeInk: '#3d9a45',
  tree: '#7cc36f',
  treeLight: '#95d289',
  treeInk: '#2f8a3a',
  trunk: '#8a6a4a',
  // accents
  red: '#c34c4a',
  redPale: '#f3c9c7',
  green: '#54b54d',
  greenDark: '#2f8a3a',
  yellow: '#ffe313',
  tyre: '#3a3a3c',
  // people
  skin: '#f3dcc8',
  shirtBlue: '#afdbf4',
  shirtGreen: '#bfe3b5',
  trousers: '#5b6f7d',
} as const

/**
 * Ink weights in CSS pixels: `bold` for silhouettes that must hold at a
 * distance, `line` for the main edges and `fine` for glazing bars, tile
 * courses, joints and markings.
 */
export type InkWeight = 'fine' | 'line' | 'bold'

export const INK_WIDTH: Record<InkWeight, number> = {
  fine: 0.6,
  line: 1.1,
  bold: 1.5,
}
