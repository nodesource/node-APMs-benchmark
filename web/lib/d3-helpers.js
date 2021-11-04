'use strict'

/**
 * Creates a simple horizontal loading bar using d3.js.
 * @param {Object} config The configuration of the progressbar.
 * @param {string} config.elementSelector The css selector for append the svg.
 * @param {number} config.width The svg width.
 * @param {number} config.height The svg height.
 * @param {number} config.duration The bar animation duration.
 * @param {string} config.color The loading bar color.
 * @param {string} config.backgroundColor The loading bar placeholder color.
 */
function createProgressBar (config) {
  const { elementSelector, width, height, percentage, color, duration, backgroundColor } = config

  // Create/append the svg to the provided selector with the provided dimensions.
  const svg = d3
    .selectAll(elementSelector)
    // .select(elementSelector)
    .append('svg')
    .attr('width', width)
    .attr('height', height)

  // Create the progress bar placeholder
  svg.append('rect')
    .attr('rx', 10)
    .attr('ry', 10)
    .attr('fill', backgroundColor)
    .attr('height', height)
    .attr('width', width)
    .attr('x', 0)

  // Create the progress bar itself, but initilized in postion x = 0 (width = 0).
  const progress = svg.append('rect')
    .attr('height', height)
    .attr('fill', color)
    .attr('width', 0)
    .attr('rx', 10)
    .attr('ry', 10)
    .attr('x', 0)

  // Create the proper scale for the loading bar
  // The scale works like:
  // The min value is 0 and will be mapped to 0,
  // The max value is a 100 (means 100%), and will be mapped to the width
  // So, for example if width is 500, the percentage:
  // 100% -> 500,
  // 40% -> 200
  // 50% -> 250
  // 0% -> 0
  // And so on...
  const scaleX = d3.scaleLinear()
    .domain([0, 100])
    .range([0, width])

  // Simply animate the loading bar with the provided duration.
  progress.transition()
    .duration(duration)
    .attr('width', scaleX(percentage))
}

export {
  createProgressBar
}
