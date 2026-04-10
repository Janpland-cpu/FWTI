
(() => {
  const state = {
    site: null,
    questions: [],
    results: null,
    answers: [],
    current: 0,
    latestResult: null,
  };

  const els = {
    homeView: document.getElementById('homeView'),
    quizView: document.getElementById('quizView'),
    resultView: document.getElementById('resultView'),
    instructionList: document.getElementById('instructionList'),
    disclaimerText: document.getElementById('disclaimerText'),
    quizPrompt: document.getElementById('quizPrompt'),
    footerText: document.getElementById('footerText'),
    startBtn: document.getElementById('startBtn'),
    prevBtn: document.getElementById('prevBtn'),
    nextBtn: document.getElementById('nextBtn'),
    restartBtn: document.getElementById('restartBtn'),
    restartShortcut: document.getElementById('restartShortcut'),
    homeShortcut: document.getElementById('homeShortcut'),
    copyBtn: document.getElementById('copyBtn'),
    answeredCount: document.getElementById('answeredCount'),
    totalCount: document.getElementById('totalCount'),
    currentIndex: document.getElementById('currentIndex'),
    progressBar: document.getElementById('progressBar'),
    dotNav: document.getElementById('dotNav'),
    questionId: document.getElementById('questionId'),
    questionPrompt: document.getElementById('questionPrompt'),
    optionList: document.getElementById('optionList'),
    resultTitle: document.getElementById('resultTitle'),
    primaryAlias: document.getElementById('primaryAlias'),
    primaryFormal: document.getElementById('primaryFormal'),
    primaryPercent: document.getElementById('primaryPercent'),
    primaryDefinition: document.getElementById('primaryDefinition'),
    resultChips: document.getElementById('resultChips'),
    systemNote: document.getElementById('systemNote'),
    secondaryCard: document.getElementById('secondaryCard'),
    secondaryLabel: document.getElementById('secondaryLabel'),
    secondaryDefinition: document.getElementById('secondaryDefinition'),
    hiddenCard: document.getElementById('hiddenCard'),
    hiddenLabel: document.getElementById('hiddenLabel'),
    hiddenDefinition: document.getElementById('hiddenDefinition'),
    groupName: document.getElementById('groupName'),
    groupSummary: document.getElementById('groupSummary'),
    hostilityName: document.getElementById('hostilityName'),
    hostilitySummary: document.getElementById('hostilitySummary'),
    gLevelName: document.getElementById('gLevelName'),
    gLevelSummary: document.getElementById('gLevelSummary'),
    sLevelName: document.getElementById('sLevelName'),
    sLevelSummary: document.getElementById('sLevelSummary'),
    scoreboard: document.getElementById('scoreboard'),
    primaryDetail: document.getElementById('primaryDetail'),
    hiddenDetailWrap: document.getElementById('hiddenDetailWrap'),
    hiddenDetail: document.getElementById('hiddenDetail'),
    optionTemplate: document.getElementById('optionTemplate'),
    dotTemplate: document.getElementById('dotTemplate'),
    scoreRowTemplate: document.getElementById('scoreRowTemplate'),
    detailBlockTemplate: document.getElementById('detailBlockTemplate')
  };

  const VIEWS = ['homeView', 'quizView', 'resultView'];

  const detailOrder = [
    ['core', '核心机制'],
    ['securitySource', '你的安全感来源'],
    ['relationshipPattern', '你的关系模式'],
    ['outward', '外在表现'],
    ['cost', '隐性代价'],
    ['misread', '常见误解'],
    ['triggers', '最易触发场景'],
    ['breakLine', '破防句'],
    ['repair', '修复方向']
  ];

  function setView(name) {
    VIEWS.forEach((key) => {
      els[key].classList.toggle('active', key === name);
    });
    const inSubView = name !== 'homeView';
    els.homeShortcut.hidden = !inSubView;
    els.restartShortcut.hidden = name !== 'resultView';
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  async function bootstrap() {
    try {
      let qData;
      let rData;
      try {
        const [qRes, rRes] = await Promise.all([
          fetch('./data/questions.json'),
          fetch('./data/results.json')
        ]);
        if (!qRes.ok || !rRes.ok) throw new Error('fetch failed');
        qData = await qRes.json();
        rData = await rRes.json();
      } catch (fetchErr) {
        if (window.__SBTI_BOOTSTRAP__) {
          qData = window.__SBTI_BOOTSTRAP__.questions;
          rData = window.__SBTI_BOOTSTRAP__.results;
        } else {
          throw fetchErr;
        }
      }
      state.site = qData.site;
      state.questions = qData.questions;
      state.results = rData;
      state.answers = new Array(state.questions.length).fill(null);

      hydrateStaticCopy();
      buildDotNav();
      bindEvents();
      renderQuestion();
      setView('homeView');
    } catch (err) {
      console.error(err);
      document.body.innerHTML = '<main style="padding:24px;color:#fff;font-family:sans-serif">页面初始化失败，请检查 JSON 路径或容器静态资源映射。</main>';
    }
  }

  function hydrateStaticCopy() {
    els.totalCount.textContent = String(state.questions.length);
    els.quizPrompt.textContent = state.site.quizPrompt;
    els.disclaimerText.textContent = state.site.disclaimer;
    els.footerText.textContent = state.site.footer;
    els.instructionList.innerHTML = '';
    state.site.instructions.forEach((text) => {
      const li = document.createElement('li');
      li.textContent = text;
      els.instructionList.appendChild(li);
    });
  }

  function bindEvents() {
    els.startBtn.addEventListener('click', startQuiz);
    els.prevBtn.addEventListener('click', () => {
      state.current = Math.max(0, state.current - 1);
      renderQuestion();
    });
    els.nextBtn.addEventListener('click', handleNext);
    els.restartBtn.addEventListener('click', resetQuiz);
    els.restartShortcut.addEventListener('click', resetQuiz);
    els.homeShortcut.addEventListener('click', () => setView('homeView'));
    els.copyBtn.addEventListener('click', copySummary);
  }

  function startQuiz() {
    setView('quizView');
    renderQuestion();
  }

  function resetQuiz() {
    state.answers = new Array(state.questions.length).fill(null);
    state.current = 0;
    state.latestResult = null;
    renderQuestion();
    setView('homeView');
  }

  function buildDotNav() {
    els.dotNav.innerHTML = '';
    state.questions.forEach((q, index) => {
      const btn = els.dotTemplate.content.firstElementChild.cloneNode(true);
      btn.textContent = q.id;
      btn.addEventListener('click', () => {
        state.current = index;
        setView('quizView');
        renderQuestion();
      });
      els.dotNav.appendChild(btn);
    });
  }

  function renderQuestion() {
    const q = state.questions[state.current];
    els.questionId.textContent = `Q${String(q.id).padStart(2, '0')}`;
    els.questionPrompt.textContent = q.prompt;
    els.currentIndex.textContent = String(state.current + 1);
    els.optionList.innerHTML = '';

    q.options.forEach((option) => {
      const node = els.optionTemplate.content.firstElementChild.cloneNode(true);
      node.querySelector('.option-key').textContent = option.key;
      node.querySelector('.option-copy').textContent = option.text;
      if (state.answers[state.current] === option.key) {
        node.classList.add('selected');
      }
      node.addEventListener('click', () => {
        state.answers[state.current] = option.key;
        renderQuestion();
      });
      els.optionList.appendChild(node);
    });

    els.prevBtn.disabled = state.current === 0;
    const answered = state.answers.filter(Boolean).length;
    els.answeredCount.textContent = String(answered);
    const pct = (answered / state.questions.length) * 100;
    els.progressBar.style.width = `${pct}%`;

    [...els.dotNav.children].forEach((dot, index) => {
      dot.classList.toggle('active', index === state.current);
      dot.classList.toggle('answered', Boolean(state.answers[index]));
    });

    const isLast = state.current === state.questions.length - 1;
    const currentAnswered = Boolean(state.answers[state.current]);
    els.nextBtn.textContent = isLast ? '提交并查看结果' : '下一题';
    els.nextBtn.disabled = !currentAnswered;
  }

  function handleNext() {
    if (!state.answers[state.current]) return;
    const isLast = state.current === state.questions.length - 1;
    if (isLast) {
      if (state.answers.some((v) => !v)) {
        const firstEmpty = state.answers.findIndex((v) => !v);
        state.current = Math.max(0, firstEmpty);
        renderQuestion();
        return;
      }
      computeAndRenderResult();
      setView('resultView');
      return;
    }
    state.current += 1;
    renderQuestion();
  }

  function avgToLevel(avg) {
    if (avg < 0.5) return 1;
    if (avg < 1.0) return 2;
    if (avg < 1.4) return 3;
    return 4;
  }

  function pickDominant(counter, fallbackMixed = null) {
    const entries = Object.entries(counter).sort((a, b) => b[1] - a[1]);
    const [first, second] = [entries[0], entries[1]];
    if (!first) return fallbackMixed ?? null;
    if (second && first[1] - second[1] <= 2 && fallbackMixed) return fallbackMixed;
    return first[0];
  }

  function evaluateHidden(allScores, groupKey, hostilityKey, gLevel, sLevel) {
    const triggered = Object.values(state.results.hiddenLabels).filter((label) => {
      const rule = label.trigger;
      const componentSum = (rule.components || []).reduce((sum, code) => sum + (allScores[code] || 0), 0);
      if (componentSum < (rule.minComponentSum || 0)) return false;
      if (rule.minG && gLevel < rule.minG) return false;
      if (rule.minS && sLevel < rule.minS) return false;
      if (rule.groupDominant && groupKey !== rule.groupDominant) return false;
      if (rule.hostilityAnyOf && !rule.hostilityAnyOf.includes(hostilityKey)) return false;
      return true;
    }).map((label) => {
      const rule = label.trigger;
      const componentSum = (rule.components || []).reduce((sum, code) => sum + (allScores[code] || 0), 0);
      return { ...label, triggerScore: componentSum };
    }).sort((a, b) => b.triggerScore - a.triggerScore);
    return triggered;
  }

  function composeSystemNote(primary, hidden, groupInfo, hostilityInfo, gLevel, sLevel) {
    const parts = [
      `你更像是拿「${groupInfo.short || groupInfo.name}」这一路在过日子。`,
      hostilityInfo ? `敌意大多走的是「${hostilityInfo.name}」这条线。` : '',
      `理想化意象 ${gLevel} 级，真实自我疏离 ${sLevel} 级。`
    ].filter(Boolean);
    if (hidden) {
      parts.push(`高阶叠加后，系统额外判出了「${hidden.alias}」。`);
    } else {
      parts.push(`这次没有触发隐藏标签，说明你的防御还没叠到最会演的那一层。`);
    }
    parts.push(`主类型落在「${primary.alias}」，说明你最熟练的求生动作已经被时代训练得很像本能。`);
    return parts.join('');
  }

  function computeAndRenderResult() {
    const labelScores = {};
    const groupScores = { M: 0, D: 0, W: 0 };
    const hostilityScores = { I: 0, O: 0, P: 0, N: 0 };
    let gTotal = 0;
    let sTotal = 0;

    Object.keys(state.results.publicLabels).forEach((code) => {
      labelScores[code] = 0;
    });

    state.questions.forEach((question, index) => {
      const selected = state.answers[index];
      const option = question.options.find((item) => item.key === selected);
      const score = option.score;
      labelScores[score.label] += 2;
      groupScores[score.group] += 1;
      hostilityScores[score.hostility] += 1;
      gTotal += score.g;
      sTotal += score.s;
    });

    const labelRanking = Object.values(state.results.publicLabels)
      .map((label) => {
        const rawScore = labelScores[label.code] || 0;
        const normalized = label.maxScore ? Math.round((rawScore / label.maxScore) * 100) : 0;
        return { ...label, rawScore, normalized };
      })
      .sort((a, b) => b.rawScore - a.rawScore || b.normalized - a.normalized);

    const primary = labelRanking[0];
    const secondary = labelRanking[1] && (primary.rawScore - labelRanking[1].rawScore <= 2) ? labelRanking[1] : null;

    const groupKey = pickDominant(groupScores, 'MIX');
    const pVal = hostilityScores.P;
    const nVal = hostilityScores.N;
    let hostilityKey = pickDominant(hostilityScores, null);
    const sortedHostility = Object.entries(hostilityScores).sort((a, b) => b[1] - a[1]);
    if ((pVal && nVal) && Math.abs(pVal - nVal) <= 1 && sortedHostility[0][1] <= Math.max(pVal, nVal) + 1) {
      hostilityKey = 'PN';
    }

    const gAvg = gTotal / state.questions.length;
    const sAvg = sTotal / state.questions.length;
    const gLevel = avgToLevel(gAvg);
    const sLevel = avgToLevel(sAvg);

    const triggeredHidden = evaluateHidden(labelScores, groupKey, hostilityKey === 'PN' ? 'P' : hostilityKey, gLevel, sLevel);
    const hidden = triggeredHidden[0] || null;

    const finalResult = {
      primary, secondary, hidden, labelRanking,
      groupKey, hostilityKey, gLevel, sLevel,
      groupScores, hostilityScores, gAvg, sAvg,
      labelScores
    };
    state.latestResult = finalResult;
    renderResult(finalResult);
  }

  function makeChip(text, soft = false) {
    const span = document.createElement('span');
    span.className = `chip${soft ? ' soft' : ''}`;
    span.textContent = text;
    return span;
  }

  function renderDetail(container, label) {
    container.innerHTML = '';
    detailOrder.forEach(([key, title]) => {
      const value = label[key];
      if (!value) return;
      const block = els.detailBlockTemplate.content.firstElementChild.cloneNode(true);
      block.querySelector('.detail-label').textContent = title;
      block.querySelector('.detail-copy').textContent = value;
      container.appendChild(block);
    });
  }

  function renderResult(result) {
    const { primary, secondary, hidden, groupKey, hostilityKey, gLevel, sLevel, labelRanking } = result;
    const dimensions = state.results.dimensions;
    const groupInfo = dimensions.groups[groupKey];
    const hostilityInfo = dimensions.hostility[hostilityKey];

    els.resultTitle.textContent = state.site.resultTitle;
    els.primaryAlias.textContent = `${primary.alias}`;
    els.primaryFormal.textContent = primary.formal;
    els.primaryPercent.textContent = `${primary.normalized}%`;
    els.primaryDefinition.textContent = primary.definition;
    els.systemNote.textContent = composeSystemNote(primary, hidden, groupInfo, hostilityInfo, gLevel, sLevel);

    els.resultChips.innerHTML = '';
    els.resultChips.appendChild(makeChip(primary.family));
    els.resultChips.appendChild(makeChip(groupInfo.name));
    els.resultChips.appendChild(makeChip(hostilityInfo.name));
    els.resultChips.appendChild(makeChip(dimensions.gLevels[String(gLevel)], true));
    els.resultChips.appendChild(makeChip(dimensions.sLevels[String(sLevel)], true));
    if (hidden) els.resultChips.appendChild(makeChip(`隐藏：${hidden.alias}`, true));

    if (secondary) {
      els.secondaryCard.classList.remove('hidden');
      els.secondaryLabel.textContent = `${secondary.alias}｜${secondary.formal}`;
      els.secondaryDefinition.textContent = secondary.definition;
    } else {
      els.secondaryCard.classList.add('hidden');
    }

    if (hidden) {
      els.hiddenCard.classList.remove('hidden');
      els.hiddenLabel.textContent = `${hidden.alias}｜${hidden.formal}`;
      els.hiddenDefinition.textContent = hidden.definition;
      els.hiddenDetailWrap.classList.remove('hidden');
      renderDetail(els.hiddenDetail, hidden);
    } else {
      els.hiddenCard.classList.add('hidden');
      els.hiddenDetailWrap.classList.add('hidden');
      els.hiddenDetail.innerHTML = '';
    }

    els.groupName.textContent = groupInfo.name;
    els.groupSummary.textContent = groupInfo.summary;
    els.hostilityName.textContent = hostilityInfo.name;
    els.hostilitySummary.textContent = hostilityInfo.summary;
    els.gLevelName.textContent = dimensions.gLevels[String(gLevel)];
    els.gLevelSummary.textContent = `本次平均值 ${result.gAvg.toFixed(2)}。你对“应该成为谁”的依赖，已经达到 ${gLevel} 级强度。`;
    els.sLevelName.textContent = dimensions.sLevels[String(sLevel)];
    els.sLevelSummary.textContent = `本次平均值 ${result.sAvg.toFixed(2)}。你和真实感受之间的距离，当前落在 ${sLevel} 级。`;

    els.scoreboard.innerHTML = '';
    labelRanking.forEach((label) => {
      const row = els.scoreRowTemplate.content.firstElementChild.cloneNode(true);
      row.querySelector('.score-title').textContent = label.alias;
      row.querySelector('.score-subtitle').textContent = label.formal;
      row.querySelector('.score-fill').style.width = `${label.normalized}%`;
      row.querySelector('.score-value').textContent = `${label.rawScore} / ${label.maxScore}`;
      els.scoreboard.appendChild(row);
    });

    renderDetail(els.primaryDetail, primary);
  }

  async function copySummary() {
    if (!state.latestResult) return;
    const { primary, secondary, hidden, groupKey, hostilityKey, gLevel, sLevel } = state.latestResult;
    const dimensions = state.results.dimensions;
    const lines = [
      'FWTI 大精神病时代人格测绘',
      `主类型：${primary.alias}｜${primary.formal}（匹配度 ${primary.normalized}%）`,
      secondary ? `副类型：${secondary.alias}｜${secondary.formal}` : null,
      hidden ? `隐藏标签：${hidden.alias}｜${hidden.formal}` : null,
      `关系取向：${dimensions.groups[groupKey].name}`,
      `敌意流向：${dimensions.hostility[hostilityKey].name}`,
      `理想化意象：${dimensions.gLevels[String(gLevel)]}`,
      `真实自我疏离：${dimensions.sLevels[String(sLevel)]}`,
      `一句话：${primary.definition}`,
      `破防句：${primary.breakLine}`
    ].filter(Boolean).join('\n');

    try {
      await navigator.clipboard.writeText(lines);
      els.copyBtn.textContent = '已复制';
      setTimeout(() => { els.copyBtn.textContent = '复制结果摘要'; }, 1400);
    } catch (err) {
      console.error(err);
      els.copyBtn.textContent = '复制失败';
      setTimeout(() => { els.copyBtn.textContent = '复制结果摘要'; }, 1400);
    }
  }

  bootstrap();
})();
