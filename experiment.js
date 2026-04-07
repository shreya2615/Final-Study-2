/****************************************************
 * Pilot Scenarios Study - CEO IMAGE ONLY
 *
 * DESIGN:
 * - Company scenario shown first
 * - 3 image-only candidate pages per scenario
 * - 3 CEO scenarios
 * - 3 candidates per scenario
 * - 9 total male faces, 1 face identity per candidate
 * - Only variants 1 and 3 used
 * - Participants assigned to 1 of 6 fixed conditions
 * - Firebase transaction keeps condition counts as even as possible
 * - Scenario order randomized
 * - Candidate order within scenario randomized
 *
 * VARIANT COUNTERBALANCING:
 * - C1 = rational choice
 * - C2 = second-best choice
 * - C3 = worst choice
 ****************************************************/

/* global firebase, initJsPsych, jsPsychHtmlKeyboardResponse, jsPsychSurveyLikert, jsPsychInstructions, jsPsychPreload */

/* ---------- Participant ID ---------- */
const urlParams = new URLSearchParams(window.location.search);
const PARTICIPANT_ID = urlParams.get('PID') || `P${Math.floor(Math.random() * 1e9)}`;

/* ---------- Config ---------- */
const RANDOMIZE_DISPLAY_ORDER = true;
const DELIM = "::";
const TARGET_PER_CONDITION = 30;

/* ---------- Paths ---------- */
function facePath(faceIndex, variant) {
  const faceNum = String(faceIndex).padStart(2, '0');
  return `assets/faces/male/face${faceNum}_var${variant}.png`;
}

/* ---------- Utils ---------- */
function shuffle(a) {
  const arr = [...a];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function ordinalWord(n) {
  return (['First', 'Second', 'Third', 'Fourth'][n - 1]) || `${n}th`;
}

/* ---------- COMPACT CSS ---------- */
(function injectCompactCssOnce() {
  if (document.getElementById('compact-trial-css')) return;

  const css = `
    body.compact-trial #jspsych-content { padding-top: 10px !important; margin-top: 0 !important; }
    body.compact-trial .jspsych-content-wrapper { padding-top: 0 !important; margin-top: 0 !important; }
    body.compact-trial .candidate-block > :first-child { margin-top: 0 !important; padding-top: 0 !important; }
    body.compact-trial .candidate-block h3 { margin: 0 0 6px 0 !important; line-height: 1.22; }
    body.compact-trial .candidate-block p { margin: 6px 0; line-height: 1.28; }
    body.compact-trial .candidate-block img { max-width: 240px; height: auto; margin: 4px 0; }
    body.compact-trial .jspsych-survey-likert-question { margin: 6px 0 !important; }
    body.compact-trial .jspsych-survey-likert-statement { margin-bottom: 6px !important; }
    body.compact-trial .jspsych-survey-likert-opts { margin: 4px 0 !important; }
    body.compact-trial .jspsych-btn { margin-top: 4px !important; }
  `;

  const el = document.createElement('style');
  el.id = 'compact-trial-css';
  el.textContent = css;
  document.head.appendChild(el);
})();

/* ---------- Content ---------- */
const CEO_SCENARIOS = [
  {
    id: 'CEO_A',
    title: 'NovaLink: Toronto, ON',
    text: `NovaLink is a Canadian tech firm, with a team of 5000 employees, that builds smart software to help companies manage their supply chains. We’ve grown across North America and are now preparing to expand into Europe. At the same time, we’re dealing with a hostile takeover attempt from a U.S. competitor. We want to remain independent and grow internationally, without losing our focus or team stability. We are looking for a new CEO to help navigate these challenges and opportunities.`
  },
  {
    id: 'CEO_B',
    title: 'GreenPath: Vancouver, BC',
    text: `GreenPath develops software to help other companies track and reduce their environmental impact in Canada and Europe. We’ve grown quickly to a team of 500, but that growth has created new pressures. We’ve fallen behind in updating our tools and platforms to keep up with new climate regulations, particularly in Europe. Furthermore, our switch back from remote to in-office mode after the COVID lockdowns has left some staff dissatisfied and unheard. We now want to consolidate and focus on doing two things better: staying ahead of environmental standards and making GreenPath a more connected and desirable place to work. We are looking for a new CEO to help us achieve these goals.`
  },
  {
    id: 'CEO_C',
    title: 'Westline Foods: Montreal, QC',
    text: `Westline Foods is a Canadian company that produces packaged meal products for major grocery chains across North America. We have been in business for 75 years and developed a strong reputation for quality and steady growth. We have 5,200 employees. Currently we are challenged by slowing sales momentum and lagging profits. Our production facilities are 20 to 30 years old and very labour intensive. The board would like to move the company into the 21st Century through AI powered automation of plants and trimming of the work force. We are looking for a new CEO who can reinvigorate our sales momentum and profit margins by opening new markets and reigning in production costs through aggressive automation and payroll reduction.`
  }
];

/*
  C1 = rational choice
  C2 = second-best choice
  C3 = worst choice
*/
const BIOS = {
  CEO_A: [
    {
      id: 'C1',
      name: 'Richard',
      status: 'rational',
      face_index: 1,
      bio: 'In my last role, I oversaw expansion of the company into Germany and the Netherlands. I speak German and have a network of contacts in both countries. Shortly after initiating the expansion, we were confronted by an aggressive takeover attempt. I worked directly with the board and our lawyers, investors, and regulators to fend off the aggression and safeguard shareholder value, while also keeping focus on our long-term corporate goals. I keep people calm and grounded when things heat up.'
    },
    {
      id: 'C2',
      name: 'Scott',
      status: 'second_best',
      face_index: 2,
      bio: 'I have successfully led the launch of software technology products in Europe as the vice president of a multinational company. I also helped set up our first offices and client networks in both Germany and Spain. I am fully conversant in German and French, and I know how to effectively navigate cultural and regulatory differences in various contexts. I’m excited about helping companies grow across borders and I like being the person who connects the dots between people and markets.'
    },
    {
      id: 'C3',
      name: 'John',
      status: 'worst',
      face_index: 3,
      bio: 'I have successfully led corporate organizations through intense and challenging internal changes, including board turnover and investor turmoil, while helping the company maintain steady focus and consistently grow profits over time. I have also worked very closely with legal teams on contract disputes, negotiations, and restructuring plans. What I bring to the table is the ability to keep a company calm, collected, and focused while things shift around them.'
    }
  ],

  CEO_B: [
    {
      id: 'C1',
      name: 'Thomas',
      status: 'rational',
      face_index: 4,
      bio: 'As vice president of a multinational green tech company, I led system updates in Germany and France to help clients comply with new EU climate regulations. Around the same time, COVID restrictions forced a shift to remote work, which caused isolation, low morale, and a loss of shared purpose. I implemented several initiatives to address these challenges, resulting in a 67% increase in retention and a 73% boost in job satisfaction over the next three years. To me, leadership means being steady, compassionate, empathetic, and mission-focused. I still bike to work and strive to live by the values we promote.'
    },
    {
      id: 'C2',
      name: 'James',
      status: 'second_best',
      face_index: 5,
      bio: 'I was appointed VP head of human resources while my current company was struggling with low morale and employee retention. My approach was to empathize and view the situation from the employee’s perspective. I initiated steps to make the employees feel heard at every level. This led to the opening of corporate daycare facilities and encouraging flexible hours. We also initiated regular company retreats to reinforce team cohesion. After three years our employee retention rate is 95% and corporate morale at an all-time high. I believe engaged, motivated employees are essential to long-term success and overall profitability.'
    },
    {
      id: 'C3',
      name: 'Brian',
      status: 'worst',
      face_index: 6,
      bio: 'I have held leadership positions at the vice president level in both marketing and finance across several well-established multinational corporations. In my marketing role, we successfully increased U.S. market share by 12% over a two-year period under my direct leadership. In the finance position, I implemented strategic measures to reduce company debt and boost shareholder equity, which ultimately resulted in a 54% increase in our stock value. I consider myself a well-rounded, seasoned corporate executive with a strong track record of results who can position your organization for sustained growth and long-term profitability.'
    }
  ],

  CEO_C: [
    {
      id: 'C1',
      name: 'Robert',
      status: 'rational',
      face_index: 7,
      bio: 'In my role as VP of a large manufacturing company, I was charged with reversing stagnating sales and declining profits. Under my lead we entered new regional and international markets while updating plants with newer automated systems that reduced labor costs and improved efficiency. This combination was instrumental in strengthening the company’s financial position over time. The role required making difficult decisions while working closely with not only sales and production teams, but also labor unions. Colleagues often described me as someone who could support growth while improving how a company operates.'
    },
    {
      id: 'C2',
      name: 'Mark',
      status: 'second_best',
      face_index: 8,
      bio: 'As VP of marketing of a national manufacturing firm, I worked closely with senior leadership during a period when sales growth had begun to stagnate across several core business sectors. Over time, we looked for opportunities beyond our usual customer base, entering new regions and building relationships in markets the company had not worked in before. Much of my career has involved helping established companies adjust when familiar sources of growth begin to level off. I tend to do my best work in organizations that need clearer direction and a stronger position in changing markets.'
    },
    {
      id: 'C3',
      name: 'Jason',
      status: 'worst',
      face_index: 9,
      bio: 'I have held senior leadership roles in finance and corporate planning across several well-established Canadian firms. In one position, I worked closely with executive leadership on long-range budgeting and capital allocation. In another, I helped strengthen reporting practices and improve visibility into business performance across divisions. I see myself as a disciplined and analytical leader who values structure, accountability, and clear decision-making. My experience has taught me that companies perform best when leadership remains focused on financial stability, internal alignment, and measured long-term planning.'
    }
  ]
};

/* ---------- Counterbalancing conditions ----------
   Each triple is [C1, C2, C3] variants for that scenario.
*/
const CONDITION_PATTERNS = {
  1: {
    CEO_A: [1, 1, 3],
    CEO_B: [3, 3, 1],
    CEO_C: [1, 3, 1]
  },
  2: {
    CEO_A: [1, 3, 1],
    CEO_B: [3, 1, 3],
    CEO_C: [3, 1, 1]
  },
  3: {
    CEO_A: [3, 1, 1],
    CEO_B: [1, 3, 3],
    CEO_C: [1, 1, 3]
  },
  4: {
    CEO_A: [3, 3, 1],
    CEO_B: [1, 1, 3],
    CEO_C: [3, 1, 3]
  },
  5: {
    CEO_A: [3, 1, 3],
    CEO_B: [1, 3, 1],
    CEO_C: [1, 3, 3]
  },
  6: {
    CEO_A: [1, 3, 3],
    CEO_B: [3, 1, 1],
    CEO_C: [3, 3, 1]
  }
};

/* ---------- Firebase ---------- */
const firebaseConfig = {
  apiKey: "AIzaSyBglBrfdOVC1ryc-rJXZaoyXxLwhGotCF4",
  authDomain: "final-study-2.firebaseapp.com",
  databaseURL: "https://final-study-2-default-rtdb.firebaseio.com",
  projectId: "final-study-2",
  storageBucket: "final-study-2.firebasestorage.app",
  messagingSenderId: "651688222372",
  appId: "1:651688222372:web:7d694f31767173f07a9031",
  measurementId: "G-ERGVP956WL"
};

const app = firebase.initializeApp(firebaseConfig);
const db = firebase.database();

/* ---------- Counterbalance state ---------- */
let PARTICIPANT_CONDITION = null;
let VARIANT_ASSIGNMENT = null;

/* ---------- Firebase condition balancing ---------- */
function assignConditionWithQuota() {
  const countsRef = db.ref("meta/condition_counts_ceo_v1v3");

  return new Promise((resolve, reject) => {
    let chosen = 1;

    countsRef.transaction(
      (current) => {
        const cur = current || {
          1: 0,
          2: 0,
          3: 0,
          4: 0,
          5: 0,
          6: 0
        };

        const all = [
          { g: 1, c: Number(cur[1] || 0) },
          { g: 2, c: Number(cur[2] || 0) },
          { g: 3, c: Number(cur[3] || 0) },
          { g: 4, c: Number(cur[4] || 0) },
          { g: 5, c: Number(cur[5] || 0) },
          { g: 6, c: Number(cur[6] || 0) }
        ];

        const eligible = all.filter(x => x.c < TARGET_PER_CONDITION);
        const pick = (eligible.length ? eligible : all).sort((a, b) => a.c - b.c)[0].g;

        chosen = pick;
        cur[pick] = Number(cur[pick] || 0) + 1;

        return cur;
      },
      (error, committed) => {
        if (error) return reject(error);
        if (!committed) return reject(new Error("Condition transaction not committed."));
        resolve(chosen);
      },
      false
    );
  });
}

/* ---------- Build preload images ---------- */
function buildPreloadImages() {
  const images = [];
  CEO_SCENARIOS.forEach((scenario) => {
    const bios = BIOS[scenario.id];
    bios.forEach((cand) => {
      images.push(facePath(cand.face_index, 1));
      images.push(facePath(cand.face_index, 3));
    });
  });
  return images;
}

/* ---------- Build candidate trials ---------- */
function buildCandidateTrials(scenario, scenarioNumber) {
  let bios = BIOS[scenario.id].map(b => ({ ...b }));

  if (RANDOMIZE_DISPLAY_ORDER) {
    bios = shuffle(bios);
  }

  const scenarioPattern = VARIANT_ASSIGNMENT[scenario.id];
  const variantMap = {
    C1: scenarioPattern[0],
    C2: scenarioPattern[1],
    C3: scenarioPattern[2]
  };

  const trials = bios.map((cand) => {
    const useVariant = variantMap[cand.id];
    const img = facePath(cand.face_index, useVariant);

    const prompt = `
      <div class="candidate-block" style="text-align:center; max-width:900px; margin:0 auto;">
        <div style="margin-bottom:22px;">
          <img src="${img}" alt="Candidate face" style="display:block; margin:4px auto; max-width:240px; height:auto;">
        </div>

        <p style="margin:18px 0 10px 0;">
          <b>How likely would you be to recommend this candidate?</b> (1 = Not at all likely, 7 = Extremely likely)
        </p>
      </div>
    `;

    return {
      type: jsPsychSurveyLikert,
      preamble: ``,
      questions: [{
        prompt,
        name: `${scenario.id}${DELIM}image${DELIM}${cand.id}`,
        labels: ["1", "2", "3", "4", "5", "6", "7"],
        required: true
      }],
      button_label: 'Continue',

      on_start: () => {
        document.body.classList.add('compact-trial');
      },

      data: {
        trial_type: 'image_only',
        scenario_id: scenario.id,
        scenario_kind: 'CEO',
        participant_id: PARTICIPANT_ID,
        condition: PARTICIPANT_CONDITION,
        candidate_id: cand.id,
        candidate_name: cand.name,
        candidate_status: cand.status,
        stimulus_file: img,
        modality: 'image',
        face_index: cand.face_index,
        variant_used: useVariant
      },

      on_finish: (data) => {
        document.body.classList.remove('compact-trial');

        const resp = (data.response && typeof data.response === 'object')
          ? data.response
          : (data.responses ? JSON.parse(data.responses) : {});

        const key = Object.keys(resp)[0];
        const rating = Number(resp[key]) + 1;
        const rt = data.rt;

        data.row_expanded = [{
          participant_id: PARTICIPANT_ID,
          scenario_id: scenario.id,
          scenario_kind: 'CEO',
          phase: 'image_only',
          condition: PARTICIPANT_CONDITION,
          candidate_id: cand.id,
          candidate_name: cand.name,
          candidate_status: cand.status,
          face_index: cand.face_index,
          variant: useVariant,
          rating,
          face_file: img,
          modality: 'image',
          rt
        }];
      }
    };
  });

  const interleaved = [];
  trials.forEach((t, i) => {
    interleaved.push(t);
    if (i < trials.length - 1) {
      interleaved.push({
        type: jsPsychHtmlKeyboardResponse,
        stimulus: `
          <div style="height:100vh; display:flex; align-items:center; justify-content:center;">
            <h1 style="font-size:48px; font-weight:normal;">+</h1>
          </div>
        `,
        choices: "NO_KEYS",
        trial_duration: 1000,
        data: {
          trial_type: 'candidate_ISI',
          scenario_id: scenario.id,
          condition: PARTICIPANT_CONDITION
        }
      });
    }
  });

  const preface = {
    type: jsPsychHtmlKeyboardResponse,
    stimulus: `
      <div style="
        height:100vh;
        display:flex;
        align-items:center;
        justify-content:center;
        padding:0 24px;
        box-sizing:border-box;
      ">
        <div style="max-width:900px; text-align:center;">
          <h3 style="margin:0 0 16px 0; font-size:30px;"><b>${scenario.title}</b></h3>
          <p style="margin:10px 0 24px 0; font-size:20px; line-height:1.5; color:rgba(0,0,0,0.85);">
            ${scenario.text}
          </p>
          <p style="font-size:18px; margin-top:24px;">
            Press <b>SPACE</b> to continue.
          </p>
        </div>
      </div>
    `,
    choices: [' '],
    data: {
      trial_type: 'preface',
      scenario_id: scenario.id,
      scenario_kind: 'CEO',
      modality: 'image',
      condition: PARTICIPANT_CONDITION
    }
  };

  const announce = {
    type: jsPsychHtmlKeyboardResponse,
    stimulus: `
      <div style="
        height:100vh;
        display:flex;
        flex-direction:column;
        justify-content:center;
        align-items:center;
        text-align:center;
      ">
        <p style="font-size:32px; margin:0 0 12px 0;">
          <b>You will now be presented with the ${ordinalWord(scenarioNumber)} company scenario.</b>
        </p>
        <p style="font-size:22px; margin:0;">
          Press <b>SPACE</b> to see the scenario.
        </p>
      </div>
    `,
    choices: [' '],
    data: {
      trial_type: 'scenario_announce',
      scenario_id: scenario.id,
      scenario_number: scenarioNumber,
      condition: PARTICIPANT_CONDITION
    }
  };

  return [announce, preface, ...interleaved];
}

/* ---------- Build all scenario trials ---------- */
function buildAllScenarioTrials() {
  const scenarioOrder = shuffle(CEO_SCENARIOS);
  const allTrials = [];
  scenarioOrder.forEach((scn, idx) => {
    allTrials.push(...buildCandidateTrials(scn, idx + 1));
  });
  return allTrials;
}

/* ---------- jsPsych Init ---------- */
document.body.style.background = 'white';
document.body.style.color = 'black';
document.body.style.fontFamily = 'Arial, sans-serif';

const jsPsych = initJsPsych({
  display_element: 'jspsych-target',
  override_safe_mode: true,
  on_finish: () => {
    const flat = [];

    jsPsych.data.get().values().forEach(tr => {
      if (Array.isArray(tr.row_expanded)) {
        tr.row_expanded.forEach(r => flat.push(r));
      }
    });

    const participantRef = db.ref('pilot_scenarios_ceo_3scenario_v1v3').child(PARTICIPANT_ID);

    function uploadAllRows() {
      if (flat.length === 0) {
        return participantRef.set({
          participant_id: PARTICIPANT_ID,
          condition: PARTICIPANT_CONDITION,
          completed: true,
          timestamp: new Date().toISOString()
        });
      }

      const writes = flat.map(r => {
        const payload = {
          participant_id: r.participant_id || PARTICIPANT_ID,
          condition: r.condition || PARTICIPANT_CONDITION,
          scenario_id: r.scenario_id || '',
          scenario_kind: r.scenario_kind || '',
          phase: r.phase || '',
          candidate_id: r.candidate_id || '',
          candidate_name: r.candidate_name || '',
          candidate_status: r.candidate_status || '',
          face_index: (typeof r.face_index === 'undefined') ? '' : r.face_index,
          variant: (typeof r.variant === 'undefined') ? '' : r.variant,
          rating: (typeof r.rating === 'undefined') ? null : r.rating,
          face_file: r.face_file || '',
          modality: r.modality || '',
          age: r.age || '',
          gender: r.gender || '',
          ethnicity: r.ethnicity || '',
          employment: r.employment || '',
          religion: r.religion || '',
          education: r.education || '',
          rt: (typeof r.rt === 'undefined') ? null : r.rt,
          timestamp: new Date().toISOString()
        };

        return participantRef.push().set(payload);
      });

      return Promise.all(writes);
    }

    uploadAllRows()
      .then(() => {
        document.body.innerHTML = `
          <div style="text-align:center; max-width:900px; margin:48px auto;">
            <h2>All done! Your completion code is <b>3D5A7B471C</b></h2>
            <p>Your responses have been securely logged, you may now close this window.</p>
          </div>
        `;
      })
      .catch(err => {
        console.error('Firebase upload failed:', err);
        alert('Firebase upload failed: ' + (err && err.message ? err.message : err));

        document.body.innerHTML = `
          <div style="text-align:center; max-width:900px; margin:48px auto;">
            <h2>All done!</h2>
            <p>Your responses could not be uploaded automatically, so they will download locally. If this has happened please email shreya.sharma2615@gmail.com.</p>
          </div>
        `;

        jsPsych.data.get().localSave('csv', 'backup_' + PARTICIPANT_ID + '.csv');
      });
  }
});

/* ---------- Timeline builder ---------- */
function buildTimeline(preloadImages, scenarioTrials) {
  const timeline = [];

  /* ---------- Consent ---------- */
  timeline.push({
    type: jsPsychHtmlKeyboardResponse,
    choices: "NO_KEYS",
    stimulus: `
      <div style="max-width:900px; margin:40px auto; font-size:16px;">
        <h2 style="text-align:center; margin-bottom:20px;"><b>Informed Consent</b></h2>

        <h3 style="text-align:center; margin-top:-10px; margin-bottom:8px;">
          Study Name: Cognitive Studies of Human Problem Solving and Reasoning
        </h3>

        <p style="text-align:center; margin-top:0; margin-bottom:25px; font-size:15px; color:#444;">
          Please scroll to the bottom of the document to enable the consent buttons.
        </p>

        <div id="consent_scrollbox" style="
          border:1px solid #ccc;
          padding:20px;
          height:380px;
          overflow-y:auto;
          border-radius:6px;
          background:white;
        ">
          <p><b>Researchers:</b><br>
          Shreya Sharma, graduate student (ssharm29@york.ca)<br>
          Supervisor: Vinod Goel, vgoel@yorku.ca</p>

          <p>We invite you to take part in this research study. Please read this document and discuss any questions or concerns that you may have with the Investigator.</p>

          <p><b>Purpose of the Research:</b> This project investigates the cognitive structures and processes underlying human reasoning & problem-solving abilities. The tasks vary between conditions but all involve attending to visual stimuli and making judgments on a computer screen.</p>

          <p><b>What You Will Be Asked to Do:</b> You will complete a demographic questionnaire and then evaluate candidates for CEO positions.</p>

          <p><b>Risks and Discomforts:</b> We do not foresee any risks or discomfort from your participation in the research. If you do feel discomfort you may withdraw at any time.</p>

          <p><b>Benefits:</b> There is no direct benefit to you, but knowledge may be gained that may help others in the future.</p>

          <p><b>Voluntary Participation:</b> Your participation is entirely voluntary and you may choose to stop participating at any time.</p>

          <p><b>Withdrawal:</b> You may withdraw at any time. If you withdraw, all associated data will be destroyed immediately.</p>

          <p><b>Confidentiality:</b> All data will be collected anonymously. Data will be stored in a secure online system accessible only to the research team.</p>

          <p><b>Questions?</b> For questions about the study, contact Dr. Vinod Goel, Eshnaa Aujla, or Shreya Sharma.</p>

          <p><b>Legal Rights and Signatures:</b><br>
          By selecting “I consent to participate,” you indicate that you have read and understood the information above and agree to participate voluntarily.</p>
        </div>

        <div style="text-align:center; margin-top:25px;">
          <button id="consent_yes" class="jspsych-btn" disabled style="opacity:0.5; margin-right:20px;">
            I consent to participate
          </button>

          <button id="consent_no" class="jspsych-btn" disabled style="opacity:0.5; background:#ccc; color:black;">
            I do NOT consent
          </button>

          <p id="scroll_notice" style="margin-top:10px; font-size:14px; color:#555;">
            Please scroll to the bottom to enable the buttons.
          </p>
        </div>
      </div>
    `,
    on_load: () => {
      const yesBtn = document.getElementById("consent_yes");
      const noBtn = document.getElementById("consent_no");
      const notice = document.getElementById("scroll_notice");
      const box = document.getElementById("consent_scrollbox");

      function checkScroll() {
        const atBottom = box.scrollTop + box.clientHeight >= box.scrollHeight - 5;
        if (atBottom) {
          yesBtn.disabled = false;
          noBtn.disabled = false;
          yesBtn.style.opacity = 1;
          noBtn.style.opacity = 1;
          notice.style.display = "none";
        }
      }

      box.addEventListener("scroll", checkScroll);

      yesBtn.onclick = () => {
        db.ref(`pilot_scenarios_ceo_3scenario_v1v3/${PARTICIPANT_ID}/consent`).set({
          consent: "yes",
          condition: PARTICIPANT_CONDITION,
          timestamp: new Date().toISOString()
        });
        jsPsych.finishTrial({ consent: "yes" });
      };

      noBtn.onclick = () => {
        db.ref(`pilot_scenarios_ceo_3scenario_v1v3/${PARTICIPANT_ID}/consent`).set({
          consent: "no",
          condition: PARTICIPANT_CONDITION,
          timestamp: new Date().toISOString()
        });

        document.body.innerHTML = `
          <div style="max-width:700px; margin:60px auto; text-align:center;">
            <h2>You have chosen not to participate.</h2>
            <p>No data has been collected.<br>You may now close this window.</p>
          </div>
        `;
      };
    }
  });

  /* ---------- Welcome ---------- */
  timeline.push({
    type: jsPsychHtmlKeyboardResponse,
    stimulus: `
      <div style="text-align:center; max-width:900px; margin:48px auto;">
        <h2><b>Welcome to the experiment</b></h2>
        <p>Imagine you are a recruiter at NorthStar Talent Collective. NorthStar helps in the identification and recruitment of employees ranging from CEOs to school teachers. You are in charge of reviewing candidate profiles for several different portfolios.</p>
        <p>Three companies are looking to hire a new <b>Chief Executive Officer (CEO)</b></p>
        <p>You will be presented with information about each company, followed by the photographs of three candidates applying for each position.</p>
        <p>Your job is to evaluate each candidate and indicate how likely you would be to recommend them for the position considering the companies’ requirements.</p>
        <p>You will first be presented with some demographic questions.</p>
        <p>Press <b>SPACE</b> to begin the demographic questionnaire.</p>
      </div>
    `,
    choices: [' ']
  });

  /* ---------- Demographics ---------- */
  timeline.push({
    type: jsPsychHtmlKeyboardResponse,
    stimulus: `
      <div style="max-width:700px; margin:48px auto; font-size:16px; text-align:left;">
        <h3 style="text-align:center; margin-bottom:16px;">Demographic Questions</h3>

        <p>
          <label for="demo_age"><b>1. What is your age?</b></label><br>
          <input name="age" id="demo_age" type="number" min="18" max="99"
                 style="width:120px; padding:4px; margin-top:4px;">
        </p>

        <p>
          <label for="demo_gender"><b>2. What is your gender?</b></label><br>
          <select name="gender" id="demo_gender"
                  style="width:260px; padding:4px; margin-top:4px;">
            <option value="" disabled selected>-- Please select --</option>
            <option value="Man">Man</option>
            <option value="Woman">Woman</option>
          </select>
        </p>

        <p>
          <label for="demo_ethnicity"><b>3. How would you describe your ethnicity?</b></label><br>
          <select name="ethnicity" id="demo_ethnicity"
                  style="width:320px; padding:4px; margin-top:4px;">
            <option value="" disabled selected>-- Please select --</option>
            <option value="White">White</option>
            <option value="Black">Black</option>
            <option value="East Asian">East Asian</option>
            <option value="South Asian">South Asian</option>
            <option value="Southeast Asian">Southeast Asian</option>
            <option value="Middle Eastern / North African">Middle Eastern / North African</option>
            <option value="Indigenous">Indigenous</option>
            <option value="Latinx">Latinx</option>
            <option value="Mixed / Multiple">Mixed / Multiple</option>
            <option value="Another ethnicity">Another ethnicity</option>
            <option value="Prefer not to say">Prefer not to say</option>
          </select>
        </p>

        <p>
          <label for="demo_employment"><b>4. What is your current employment status?</b></label><br>
          <select name="employment" id="demo_employment"
                  style="width:320px; padding:4px; margin-top:4px;">
            <option value="" disabled selected>-- Please select --</option>
            <option value="Employed full-time">Employed full-time</option>
            <option value="Employed part-time">Employed part-time</option>
            <option value="Self-employed">Self-employed</option>
            <option value="Unemployed">Unemployed</option>
            <option value="Student">Student</option>
            <option value="Student and employed">Student and employed</option>
            <option value="Other">Other</option>
            <option value="Prefer not to say">Prefer not to say</option>
          </select>
        </p>

        <p>
          <label for="demo_religion"><b>5. What is your current religious or spiritual affiliation?</b></label><br>
          <select name="religion" id="demo_religion"
                  style="width:320px; padding:4px; margin-top:4px;">
            <option value="" disabled selected>-- Please select --</option>
            <option value="None / atheist / agnostic">None / atheist / agnostic</option>
            <option value="Christian">Christian</option>
            <option value="Muslim">Muslim</option>
            <option value="Jewish">Jewish</option>
            <option value="Hindu">Hindu</option>
            <option value="Buddhist">Buddhist</option>
            <option value="Sikh">Sikh</option>
            <option value="Another religion / spirituality">Another religion / spirituality</option>
            <option value="Prefer not to say">Prefer not to say</option>
          </select>
        </p>

        <p>
          <label for="demo_edu"><b>6. What is your highest level of education completed?</b></label><br>
          <select name="education" id="demo_edu"
                  style="width:320px; padding:4px; margin-top:4px;">
            <option value="" disabled selected>-- Please select --</option>
            <option value="High school">High school</option>
            <option value="Some college/university">Some college/university</option>
            <option value="Undergraduate degree">Undergraduate degree</option>
            <option value="Graduate degree">Graduate degree</option>
            <option value="Prefer not to say">Prefer not to say</option>
          </select>
        </p>

        <div style="text-align:center; margin-top:24px;">
          <button id="demo_continue" class="jspsych-btn">Continue</button>
        </div>
      </div>
    `,
    choices: "NO_KEYS",
    on_load: () => {
      const btn = document.getElementById('demo_continue');
      if (!btn) return;

      btn.addEventListener('click', () => {
        const age = String(document.getElementById('demo_age').value || '').trim();
        const gender = document.getElementById('demo_gender').value;
        const ethnicity = document.getElementById('demo_ethnicity').value;
        const employment = document.getElementById('demo_employment').value;
        const religion = document.getElementById('demo_religion').value;
        const education = document.getElementById('demo_edu').value;

        if (!age || !gender || !ethnicity || !employment || !religion || !education) {
          alert("Please answer all questions before continuing.");
          return;
        }

        const demoRow = {
          participant_id: PARTICIPANT_ID,
          condition: PARTICIPANT_CONDITION,
          phase: 'demographics',
          age,
          gender,
          ethnicity,
          employment,
          religion,
          education
        };

        jsPsych.finishTrial({
          trial_type: 'demographics',
          participant_id: PARTICIPANT_ID,
          condition: PARTICIPANT_CONDITION,
          age,
          gender,
          ethnicity,
          employment,
          religion,
          education,
          row_expanded: [demoRow]
        });
      });
    }
  });

  /* ---------- Instructions ---------- */
  timeline.push({
    type: jsPsychInstructions,
    pages: [
      `<div style="text-align:center; max-width:900px; margin:48px auto;">
         <h3><b>Instructions</b></h3>
         <p>You will now be presented with <b>three different scenarios</b> of companies looking to hire a new CEO.</p>
         <p>For each company scenario, you will first see the company information and then the photographs of three applicants.</p>
         <p>Your task is to rate how likely you are to shortlist that candidate for an interview. Rate each candidate on a scale of 1 to 7, with <b>1</b> being <b>not at all likely to recommend</b> and <b>7</b> being <b>very likely to recommend</b>.</p>
         <p>The experiment may take a few minutes to load, please make sure you have a stable internet connection.</p>
         <p>Please press <b>NEXT</b> to proceed.</p>
       </div>`
    ],
    show_clickable_nav: true
  });

  /* ---------- Preload ---------- */
  timeline.push({
    type: jsPsychPreload,
    images: preloadImages
  });

  /* ---------- Scenario trials ---------- */
  timeline.push(...scenarioTrials);

  /* ---------- End ---------- */
  timeline.push({
    type: jsPsychHtmlKeyboardResponse,
    stimulus: `
      <div style="text-align:center; max-width:900px; margin:48px auto;">
        <h3>Thank you!</h3>
        <p>Press <b>SPACE</b> to finish.</p>
      </div>
    `,
    choices: [' ']
  });

  return timeline;
}

/* ---------- Start experiment only after condition is assigned ---------- */
(async function startExperiment() {
  try {
    PARTICIPANT_CONDITION = await assignConditionWithQuota();
    VARIANT_ASSIGNMENT = CONDITION_PATTERNS[PARTICIPANT_CONDITION];

    await db.ref(`participants/${PARTICIPANT_ID}/meta/condition_assignment`).set({
      participant_id: PARTICIPANT_ID,
      condition: PARTICIPANT_CONDITION,
      timestamp: Date.now()
    });

    jsPsych.data.addProperties({
      participant_id: PARTICIPANT_ID,
      condition: PARTICIPANT_CONDITION
    });

    const preloadImages = buildPreloadImages();
    const scenarioTrials = buildAllScenarioTrials();
    const timeline = buildTimeline(preloadImages, scenarioTrials);

    jsPsych.run(timeline);
  } catch (err) {
    console.error("Startup failed:", err);
    document.body.innerHTML = `
      <div style="text-align:center; max-width:900px; margin:48px auto;">
        <h2>The experiment could not start.</h2>
        <p>Please refresh the page or contact the researcher.</p>
        <p style="font-family:monospace; color:#666;">${String(err && err.message ? err.message : err)}</p>
      </div>
    `;
  }
})();