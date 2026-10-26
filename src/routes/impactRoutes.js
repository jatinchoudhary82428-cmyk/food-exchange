// Live Impact Tracker & Analytics Route
const { getDatabase } = require('../database/db');
const {
  COMMUNITY_BASELINE_MEALS,
  COMMUNITY_BASELINE_KG,
  CO2_FACTOR_KG
} = require('../config');

function handleImpactRoutes(req, res, url) {
  const db = getDatabase();

  if (req.method === 'GET' && url.pathname === '/api/impact') {
    // Aggregated stats from listings
    const rescuedStats = db.prepare(`
      SELECT
        COALESCE(SUM(servings_est), 0) AS rescued_servings,
        COALESCE(SUM(weight_kg_est), 0) AS rescued_weight_kg,
        COUNT(CASE WHEN status = 'Available' THEN 1 END) AS available_count,
        COUNT(CASE WHEN status = 'Completed' THEN 1 END) AS completed_count,
        COUNT(CASE WHEN status = 'Claimed' OR status = 'In Transit' THEN 1 END) AS in_progress_count
      FROM listings
      WHERE status IN ('Claimed', 'In Transit', 'Completed')
    `).get();

    // User counts
    const userStats = db.prepare(`
      SELECT
        COUNT(CASE WHEN role = 'ngo' THEN 1 END) AS active_ngos,
        COUNT(CASE WHEN role = 'donor' THEN 1 END) AS active_donors,
        COUNT(CASE WHEN role = 'volunteer' THEN 1 END) AS active_volunteers
      FROM users
    `).get();

    const totalMealsSaved = COMMUNITY_BASELINE_MEALS + Number(rescuedStats.rescued_servings);
    const totalFoodWasteSavedKg = parseFloat((COMMUNITY_BASELINE_KG + Number(rescuedStats.rescued_weight_kg)).toFixed(1));
    const totalCo2PreventedKg = parseFloat((totalFoodWasteSavedKg * CO2_FACTOR_KG).toFixed(1));

    // Recent activity log
    const recentActivity = db.prepare(`
      SELECT
        l.id,
        l.title,
        l.servings_est,
        l.status,
        l.claimed_by_name,
        l.volunteer_name,
        l.created_at,
        l.claimed_at,
        l.completed_at,
        u.name AS donor_name
      FROM listings l
      JOIN users u ON l.donor_id = u.id
      ORDER BY COALESCE(l.completed_at, l.claimed_at, l.created_at) DESC
      LIMIT 5
    `).all();

    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      metrics: {
        mealsSaved: totalMealsSaved,
        activeNGOs: userStats.active_ngos,
        foodWasteSavedKg: totalFoodWasteSavedKg,
        co2PreventedKg: totalCo2PreventedKg,
        availableListings: rescuedStats.available_count,
        completedDonations: rescuedStats.completed_count,
        inProgressDonations: rescuedStats.in_progress_count,
        activeDonors: userStats.active_donors,
        activeVolunteers: userStats.active_volunteers
      },
      recentActivity
    }));
    return true;
  }

  return false;
}

module.exports = {
  handleImpactRoutes
};
