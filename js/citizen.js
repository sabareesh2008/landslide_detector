/**
 * LANDSLIDE SENTINEL AI - Citizen Portal & Emergency Advisory Component
 */

const ADVISORIES = {
  en: {
    title: "Civil Protection & Monsoon Landslide Safety Advisory",
    subtitle: "Rangpo–Singtam / NH-10 Highway Corridor, Sikkim",
    instructions: [
      "Avoid non-essential vehicular movement on NH-10 during continuous torrential downpours exceeding 20mm/h.",
      "Hillside settlement residents should inspect retaining wall weep holes and look out for tension cracks or leaning trees.",
      "If sudden muddy stream runoff or rumbling noises are observed from upper ridges, immediately evacuate to higher stable ground.",
      "Do not attempt to cross flooded road dips or active rockfall zones on the Melli–Rangpo–Singtam stretch.",
      "Keep emergency battery torches, essential medical supplies, and offline emergency helpline contacts readily accessible."
    ]
  },
  hi: {
    title: "नागरिक सुरक्षा एवं भूस्खलन पूर्व चेतावनी दिशानिर्देश",
    subtitle: "रंगपो–सिंगताम / एनएच-10 राष्ट्रीय राजमार्ग, सिक्किम",
    instructions: [
      "लगातार भारी मानसूनी बारिश (20 मिमी/घंटा से अधिक) के दौरान एनएच-10 पर अनावश्यक यात्रा से बचें।",
      "पहाड़ी ढलानों पर रहने वाले निवासी अपनी रिटेनिंग दीवारों में तनाव की दरारें या झुके हुए पेड़ों पर नजर रखें।",
      "यदि पहाड़ी ढलान से अचानक कीचड़युक्त पानी या गड़गड़ाहट की आवाज सुनाई दे, तो तुरंत सुरक्षित स्थान पर चले जाएं।",
      "मेल्ली-रंगपो-सिंगताम मार्ग पर सक्रिय पत्थरों के गिरने वाले क्षेत्रों को पार करने का प्रयास न करें।",
      "आपातकालीन टॉर्च, आवश्यक दवाइयां और हेल्पलाइन नंबर अपने पास सुरक्षित रखें।"
    ]
  },
  ne: {
    title: "नागरिक सुरक्षा तथा पहिरो पूर्व चेतावनी निर्देशिका",
    subtitle: "रङ्पो–सिङताम / एनएच-१० राजमार्ग क्षेत्र, सिक्किम",
    instructions: [
      "निरन्तर भारी वर्षा (२० मिमी/घण्टाभन्दा बढी) भएको समयमा एनएच-१० मा अनावश्यक यात्रा नगर्नुहोस्।",
      "पहाडी भिरालो भागमा बस्ने बासिन्दाहरूले पर्खालहरूमा धाँजा फाटेको वा रूखहरू ढल्किएको ध्यान दिनुहोस्।",
      "माथिल्लो डाँडाबाट अचानक लेदो बगेको वा ठूलो आवाज आएमा तुरुन्तै सुरक्षित खुला स्थानमा जानुहोस्।",
      "मल्ली-रङ्पो-सिङताम खण्डमा पहिरो खसिरहेको ठाउँबाट जबरजस्ती गाडी नचलाउनुहोस्।",
      "आपत्कालीन टर्च, प्राथमिक उपचारका औषधिहरू र हेल्पलाइन नम्बरहरू साथमा राख्नुहोस्।"
    ]
  }
};

export function renderCitizenView(lang = 'en') {
  const container = document.getElementById('citizen-advisory-container');
  if (!container) return;
  
  const adv = ADVISORIES[lang] || ADVISORIES.en;
  
  container.innerHTML = `
    <div class="card" style="margin-bottom: 20px;">
      <div class="card-header">
        <span class="card-title">📢 ${adv.title}</span>
        <span class="text-xs text-cyan font-mono">${adv.subtitle}</span>
      </div>
      <div class="card-body">
        <ul style="display: flex; flex-direction: column; gap: 10px; font-size: 0.88rem; color: #cbd5e1; padding-left: 20px;">
          ${adv.instructions.map(inst => `<li>${inst}</li>`).join('')}
        </ul>
      </div>
    </div>

    <!-- Emergency Contacts Directory -->
    <div class="card">
      <div class="card-header">
        <span class="card-title">📞 Emergency Response Directory (Sikkim & NH-10)</span>
      </div>
      <div class="card-body">
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 14px;">
          <div class="p-3" style="background: var(--bg-card); border: 1px solid var(--border-color); border-radius: 8px;">
            <strong class="text-white">State Disaster Management Authority (SSDMA)</strong>
            <div class="font-mono text-cyan text-sm mt-1">1070 / 03592-201075</div>
            <div class="text-xs text-muted">Gangtok Control Room (24/7)</div>
          </div>
          <div class="p-3" style="background: var(--bg-card); border: 1px solid var(--border-color); border-radius: 8px;">
            <strong class="text-white">National Disaster Response Force (NDRF)</strong>
            <div class="font-mono text-cyan text-sm mt-1">03592-202999 / 94340-12345</div>
            <div class="text-xs text-muted">2nd Battalion Regional Response Center</div>
          </div>
          <div class="p-3" style="background: var(--bg-card); border: 1px solid var(--border-color); border-radius: 8px;">
            <strong class="text-white">NH-10 Highway Authority (NHIDCL)</strong>
            <div class="font-mono text-cyan text-sm mt-1">1033 / 03592-231144</div>
            <div class="text-xs text-muted">Road Blockage & Emergency Towing</div>
          </div>
          <div class="p-3" style="background: var(--bg-card); border: 1px solid var(--border-color); border-radius: 8px;">
            <strong class="text-white">Rangpo Sub-Divisional Police / Fire</strong>
            <div class="font-mono text-cyan text-sm mt-1">112 / 03592-240822</div>
            <div class="text-xs text-muted">Teesta Border Checkpost</div>
          </div>
        </div>
      </div>
    </div>
  `;
}
