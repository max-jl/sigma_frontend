import React, { useEffect, useState } from 'react';

// For tt_countdown && tt_daily
// Will be replaced with api data later on
const data = JSON.parse(localStorage.getItem("data"));

const daily_information = data["dt"]

// For tt_weekly
// Will be replaced with api data later on
const weekly_information = data["tt"]



// Data formatting should be done below
const weekly_formatted = weekly_information
const daily_formatted = daily_information





// Exporting of formatted data to tt_daily and tt_weekly
export { weekly_formatted, daily_formatted };

