# Group bookings, 2–10 pax

Objective: select an exact total group size and compare quoted cabin combinations; 5 pax must use a quoted triple plus twin. Keep repeat bookings separate.
Protected: original rates, per-offer discounts/free fares, source currencies, PHP checkbox, highlighted cabin total, sailing-specific gratuities, deposit USD300 per guest, source images and guide.
Implementation: pure combination generator; integrate selection, per-cabin guest fares, rate-specific gratuities, sailing comparisons and portable HTML. Offer progressive disclosure of alternatives to keep the page compact.
Risks: combinatorial duplicates, misapplied 3+1 across cabins, rounding weighted gratuities, stale selection after sailing changes. Use quoted arrangements as indivisible units, canonical IDs and exact gratuity sums.
Acceptance: every option for 2–10 fits exact pax; 5 has triple+twin; repeat quantity scales all fields; mixed suite gratuities preserve source rate by group; no fabricated rates; all original 28 totals unchanged.
Validation: node syntax checks; pure Node assertions over all combinations, both seasons, original quotations, promos and repeat totals; browser 5/6/10 pax and mixed-currency/PHP states; mobile overflow check.
Status: complete. Validation passed: 2,490 combinations across both seasons; all 28 original package totals; quantity scaling, mixed gratuities and 3+1 integrity. Browser verified 5/6/10 pax, PHP/native currency states, sailing comparisons, progressive options and 390px layout without horizontal overflow. Rollback: revert group helper and selector integration; offers remain untouched.
