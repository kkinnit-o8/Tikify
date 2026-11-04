// phone('player', { x, y, scale, rotate }) → a framed screen render, positioned on a board.
function phone(screen, { x = 0, y = 0, scale = 1, rotate = 0, z = 1, src = null, h = 852 } = {}) {
  const img = src || `../screens/${screen}.png`;
  return `<div class="phone" style="left:${x}px;top:${y}px;z-index:${z};height:${h + 24}px;transform:scale(${scale}) rotate(${rotate}deg)">
    <i class="btn a"></i><i class="btn b"></i><i class="btn c"></i><img class="scr" style="height:${h}px;${h < 852 ? 'object-fit:cover;border-radius:44px' : ''}" src="${img}"></div>`;
}
const glow = (x, y, r, color, o = .6) =>
  `<div class="glow" style="left:${x - r}px;top:${y - r}px;width:${2 * r}px;height:${2 * r}px;background:${color};opacity:${o}"></div>`;
