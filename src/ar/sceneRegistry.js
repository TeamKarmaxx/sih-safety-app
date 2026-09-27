/**
 * AR Scene Registry
 * ------------------
 * Maps a drill's real backend fields (`ar_scene`, `hazard_type`) to the
 * frontend screen that renders its AR training experience.
 *
 * Only two screens exist to route to: "fire" (FireModule.jsx) and "gas"
 * (GasModule.jsx). A drill that matches neither returns null, and the
 * calling screen must show "no AR experience available" — never fabricate
 * a scene.
 *
 * CONFIRMED REAL BACKEND VALUES (from the actual seeded FastAPI database,
 * reported directly by the user testing against the live backend):
 *
 *   ar_scene = "mine_emergency_01"  (title: "Emergency Evacuation Drill",
 *                                    hazard_type: "Emergency evacuation")
 *     -> "fire"  (the existing industrial-emergency AR experience)
 *
 *   ar_scene = "mine_tunnel_01"     (title: "Mine Tunnel Emergency Drill",
 *                                    hazard_type: "Tunnel hazard")
 *     -> "gas"   (the existing confined-space/tunnel-hazard AR experience)
 *
 * EXACT_SCENE_MAP below is checked first and is the primary mechanism, as
 * instructed. Generic keyword matching against `ar_scene`/`hazard_type` is
 * kept only as a secondary fallback for drills added later whose exact
 * `ar_scene` value isn't in this table yet — it must never be relied on as
 * the primary mechanism, and it does not need to (and currently does not)
 * cover "emergency evacuation" or "tunnel hazard" wording, since those two
 * real drills are now handled by the exact table.
 */
const EXACT_SCENE_MAP = {
  mine_emergency_01: "fire",
  mine_tunnel_01: "gas",
};

const KEYWORD_TO_SCREEN = [
  {
    screen: "fire",
    keywords: ["fire", "flame", "explosion", "burn", "combust", "ignition", "smoke", "blaze"],
  },
  {
    screen: "gas",
    keywords: [
      "gas",
      "leak",
      "confined",
      "toxic",
      "fume",
      "vapor",
      "vapour",
      "chemical",
      "spill",
      "asphyx",
      "tunnel",
    ],
  },
];

function matchExact(arScene) {
  if (!arScene) return null;
  return EXACT_SCENE_MAP[arScene.trim()] || null;
}

function matchByKeywords(value) {
  const lower = (value || "").toLowerCase();
  if (!lower) return null;
  for (const { screen, keywords } of KEYWORD_TO_SCREEN) {
    if (keywords.some((keyword) => lower.includes(keyword))) return screen;
  }
  return null;
}

/**
 * Resolve which existing screen (if any) should handle a drill's AR
 * training experience.
 *
 * Order: (1) exact `ar_scene` match against EXACT_SCENE_MAP — the
 * confirmed, primary mechanism; (2) keyword match against `ar_scene`; (3)
 * keyword match against `hazard_type`. Returns null only when none of
 * these match, meaning this is a genuinely new/unmapped drill.
 */
export function resolveDrillScreen(drill) {
  if (!drill) return null;

  return matchExact(drill.ar_scene) || matchByKeywords(drill.ar_scene) || matchByKeywords(drill.hazard_type) || null;
}
