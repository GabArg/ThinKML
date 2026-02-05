// ThinkML — Data Problem Reasoning Assistant
// Pure client-side diagnostic engine

// State management (Internal values remain in English)
const state = {
    outcome_type: null,
    target_known_clarify: null, // For "I don't know" branch
    usage_context: null,
    error_impact: null,
    target_known: null,
    data_size: null,
    data_types: []
};

// Initialize app
document.addEventListener('DOMContentLoaded', () => {
    setupEventListeners();
});

function setupEventListeners() {
    // Landing Screen: Start Diagnosis
    document.getElementById('btn-start-diagnosis').addEventListener('click', () => {
        showScreen('screen-outcome-type');
    });

    // Step 1: Outcome Type
    const outcomeButtons = document.querySelectorAll('#screen-outcome-type .option-card');
    outcomeButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            state.outcome_type = btn.dataset.value;

            if (state.outcome_type === 'unknown') {
                showScreen('screen-clarify-target');
            } else {
                showScreen('screen-decision-context');
            }
        });
    });

    // Clarifying screen for "I don't know"
    const clarifyButtons = document.querySelectorAll('#screen-clarify-target .option-btn');
    clarifyButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            state.target_known_clarify = btn.dataset.value === 'yes';
            showScreen('screen-decision-context');
        });
    });

    // Step 2: Decision Context
    const contextButtons = document.querySelectorAll('#screen-decision-context .option-btn');
    contextButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            state.usage_context = btn.dataset.value;
            showScreen('screen-cost-error');
        });
    });

    // Step 3: Cost of Error
    const errorButtons = document.querySelectorAll('#screen-cost-error .option-btn');
    errorButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            state.error_impact = btn.dataset.value;
            showScreen('screen-data-situation');
        });
    });

    // Step 4: Data Situation - validation for continue button
    const targetRadios = document.querySelectorAll('input[name="target_known"]');
    const sizeRadios = document.querySelectorAll('input[name="data_size"]');
    const typeCheckboxes = document.querySelectorAll('input[name="data_types"]');
    const continueBtn = document.getElementById('btn-continue-data');

    function validateDataForm() {
        const hasTarget = Array.from(targetRadios).some(r => r.checked);
        const hasSize = Array.from(sizeRadios).some(r => r.checked);
        const hasTypes = Array.from(typeCheckboxes).some(c => c.checked);

        continueBtn.disabled = !(hasTarget && hasSize && hasTypes);
    }

    targetRadios.forEach(radio => radio.addEventListener('change', validateDataForm));
    sizeRadios.forEach(radio => radio.addEventListener('change', validateDataForm));
    typeCheckboxes.forEach(checkbox => checkbox.addEventListener('change', validateDataForm));

    continueBtn.addEventListener('click', () => {
        // Collect form data - convert to proper types
        state.target_known = document.querySelector('input[name="target_known"]:checked').value === 'yes';
        state.data_size = document.querySelector('input[name="data_size"]:checked').value;
        state.data_types = Array.from(typeCheckboxes)
            .filter(c => c.checked)
            .map(c => c.value);

        // Generate diagnostic
        const diagnostic = diagnose(state);
        displayResult(diagnostic);
        showScreen('screen-result');
    });

    // Restart button
    document.getElementById('btn-restart').addEventListener('click', () => {
        resetState();
        showScreen('screen-outcome-type');
    });
}

function showScreen(screenId) {
    document.querySelectorAll('.screen').forEach(screen => {
        screen.classList.remove('active');
    });
    document.getElementById(screenId).classList.add('active');

    // Update Progress Bar
    const progressMap = {
        'screen-landing': 0,
        'screen-outcome-type': 20,
        'screen-clarify-target': 25,
        'screen-decision-context': 45,
        'screen-cost-error': 70,
        'screen-data-situation': 90,
        'screen-result': 100
    };

    const progress = progressMap[screenId] || 0;
    const bar = document.getElementById('progress-bar');
    if (bar) {
        bar.style.width = `${progress}%`;
        // Hide bar on landing
        bar.parentElement.style.opacity = screenId === 'screen-landing' ? '0' : '1';
    }
}

function resetState() {
    // Reset state
    Object.keys(state).forEach(key => {
        state[key] = Array.isArray(state[key]) ? [] : null;
    });

    // Reset form inputs
    document.querySelectorAll('input[type="radio"]').forEach(input => input.checked = false);
    document.querySelectorAll('input[type="checkbox"]').forEach(input => input.checked = false);
    document.getElementById('btn-continue-data').disabled = true;
}

// =============================================================================
// DIAGNOSTIC ENGINE — Ruleset v1 (Deterministic - Spanish Localization)
// =============================================================================

function diagnose(state) {
    let learning_type = '';
    let recommended_models = [];
    let recommended_metrics = [];
    let risk_flags = [];
    let validation_strategy = '';
    let summary_text = '';

    // Handle "unknown" outcome type with clarifying question
    let effective_outcome = state.outcome_type;
    if (state.outcome_type === 'unknown') {
        effective_outcome = state.target_known_clarify ? 'category' : 'groups';
    }

    // RULE 1: Determine learning_type (Spanish)
    if (effective_outcome === 'number') {
        learning_type = 'regresión supervisada';
    } else if (effective_outcome === 'category') {
        learning_type = 'clasificación supervisada';
    } else if (effective_outcome === 'groups') {
        learning_type = 'agrupamiento no supervisado';
    } else if (effective_outcome === 'time') {
        learning_type = 'pronóstico de series temporales';
    } else if (effective_outcome === 'ranking') {
        learning_type = 'ranking / recomendación';
    } else if (effective_outcome === 'unknown' && !state.target_known) {
        learning_type = 'problema aún no definido';
    }

    // RULE 2: Recommended model families
    if (effective_outcome === 'number') {
        recommended_models = ['Regresión Lineal', 'Regresión Regularizada (Lasso/Ridge)', 'Ensambles de Árboles (Random Forest, XGBoost)'];
    } else if (effective_outcome === 'category') {
        recommended_models = ['Regresión Logística', 'Árboles de Decisión', 'Gradient Boosting'];
    } else if (effective_outcome === 'groups') {
        recommended_models = ['K-Means', 'Clustering Jerárquico', 'Clustering basado en densidad (DBSCAN)'];
    } else if (effective_outcome === 'time') {
        recommended_models = ['Modelos tipo ARIMA', 'Suavizado Exponencial', 'Modelos Secuenciales (RNN/LSTM)'];
    } else if (effective_outcome === 'ranking') {
        recommended_models = ['Modelos de Scoring', 'Filtrado Colaborativo', 'Learning to Rank'];
    } else {
        recommended_models = [];
    }

    // RULE 3: Metrics
    if (effective_outcome === 'number') {
        recommended_metrics = ['MAE (Error Absoluto Medio)', 'RMSE (Raíz del Error Cuadrático Medio)'];
    } else if (effective_outcome === 'category') {
        recommended_metrics = ['Precisión', 'Recall (Sensibilidad)', 'ROC-AUC'];
    } else if (effective_outcome === 'groups') {
        recommended_metrics = ['Coeficiente de Silueta', 'Estabilidad del Clúster'];
    } else if (effective_outcome === 'time') {
        recommended_metrics = ['MAE en el tiempo', 'Estabilidad del pronóstico'];
    } else if (effective_outcome === 'ranking') {
        recommended_metrics = ['Relevancia Top-K', 'Consistencia del ranking'];
    } else {
        recommended_metrics = [];
    }

    // Add human review requirement for critical impact
    if (state.error_impact === 'critical') {
        recommended_metrics.push('umbral de revisión humana requerido');
    }

    // RULE 4: Risk flags (Spanish)
    // Start with empty list, add based on conditions

    if (state.data_size === 'small') {
        risk_flags.push('alto riesgo de sobreajuste');
    }

    if (state.data_types.includes('text') && state.data_size === 'small') {
        risk_flags.push('datos dispersos de alta dimensión');
    }

    if (!state.target_known && effective_outcome !== 'groups') {
        risk_flags.push('falta definición de etiqueta');
    }

    if (state.data_types.includes('time') && learning_type !== 'pronóstico de series temporales') {
        risk_flags.push('riesgo de fuga temporal (leakage)');
    }

    if (state.usage_context === 'automated' && state.error_impact === 'critical') {
        risk_flags.push('riesgo en automatización de decisiones');
    }

    // RULE 5: Validation strategy (Spanish)
    if (learning_type === 'pronóstico de series temporales') {
        validation_strategy = 'Usar validación por división cronológica';
    } else if (state.data_size === 'small') {
        validation_strategy = 'Usar validación cruzada (cross-validation)';
    } else {
        validation_strategy = 'Usar división entrenamiento/prueba con conjunto de validación';
    }

    // Helper mappings for summary text
    const context_map = {
        'human': 'análisis humano',
        'business': 'decisión de negocio',
        'automated': 'decisión automática'
    };

    const impact_map = {
        'low': 'sin impacto relevante',
        'moderate': 'impacto significativo',
        'critical': 'impacto crítico'
    };

    const size_map = {
        'small': 'pequeño',
        'medium': 'mediano',
        'large': 'grande'
    };

    const es_context = context_map[state.usage_context] || state.usage_context;
    const es_impact = impact_map[state.error_impact] || state.error_impact;
    const es_size = size_map[state.data_size] || state.data_size;

    // RULE 6: Summary text (Expert tone - Spanish)
    if (risk_flags.length > 0) {
        summary_text = `El problema corresponde a ${learning_type} dentro de un contexto de ${es_context}. Dado el ${es_impact} y un conjunto de datos ${es_size}, se debe prestar atención a: ${risk_flags[0]}.`;
    } else {
        summary_text = `El problema corresponde a ${learning_type} dentro de un contexto de ${es_context}. El tamaño del conjunto de datos (${es_size}) y el nivel de impacto (${es_impact}) indican un flujo de trabajo de modelado estándar.`;
    }

    // RULE 7: Next Steps (deterministic checklist - Spanish)
    const next_steps = generateNextSteps(learning_type);

    return {
        learning_type,
        recommended_models,
        recommended_metrics,
        risk_flags,
        validation_strategy,
        summary_text,
        next_steps
    };
}

function generateNextSteps(learning_type) {
    const steps = [];

    // Logic checks match the SPANISH strings assigned in Rule 1
    if (learning_type === 'regresión supervisada') {
        steps.push('Definir unidades de la variable objetivo');
        steps.push('Inspeccionar distribución y valores atípicos');
        steps.push('Construir predictor promedio base (baseline)');
    } else if (learning_type === 'clasificación supervisada') {
        steps.push('Verificar balance de clases');
        steps.push('Definir clase positiva');
        steps.push('Construir clasificador mayoritario base');
    } else if (learning_type === 'agrupamiento no supervisado') {
        steps.push('Estandarizar características (features)');
        steps.push('Elegir métrica de distancia');
        steps.push('Evaluar estabilidad del clúster');
    } else if (learning_type === 'pronóstico de series temporales') {
        steps.push('Ordenar cronológicamente');
        steps.push('Verificar estacionalidad');
        steps.push('Construir pronóstico ingenuo base (naive)');
    } else if (learning_type === 'ranking / recomendación') {
        steps.push('Definir criterios de relevancia');
        steps.push('Construir regla de puntuación simple');
        steps.push('Evaluar consistencia top-k');
    } else {
        steps.push('Clarificar definición del problema');
        steps.push('Identificar datos disponibles');
        steps.push('Determinar variable objetivo');
    }

    return steps;
}

function displayResult(diagnostic) {
    // Summary
    document.getElementById('result-summary').textContent = diagnostic.summary_text;

    // Learning type
    document.getElementById('result-learning-type').textContent = diagnostic.learning_type;

    // Models
    const modelsUl = document.getElementById('result-models');
    modelsUl.innerHTML = '';
    diagnostic.recommended_models.forEach(model => {
        const li = document.createElement('li');
        li.textContent = model;
        modelsUl.appendChild(li);
    });

    // Metrics
    const metricsUl = document.getElementById('result-metrics');
    metricsUl.innerHTML = '';
    diagnostic.recommended_metrics.forEach(metric => {
        const li = document.createElement('li');
        li.textContent = metric;
        metricsUl.appendChild(li);
    });

    // Risks
    const risksUl = document.getElementById('result-risks');
    risksUl.innerHTML = '';
    if (diagnostic.risk_flags.length === 0) {
        const li = document.createElement('li');
        li.textContent = 'No se identificaron riesgos mayores con la información provista';
        risksUl.appendChild(li);
    } else {
        diagnostic.risk_flags.forEach(risk => {
            const li = document.createElement('li');
            li.textContent = risk;
            risksUl.appendChild(li);
        });
    }

    // Validation
    document.getElementById('result-validation').textContent = diagnostic.validation_strategy;

    // Next Steps
    const nextStepsUl = document.getElementById('result-next-steps');
    nextStepsUl.innerHTML = '';
    diagnostic.next_steps.forEach(step => {
        const li = document.createElement('li');
        li.textContent = step;
        nextStepsUl.appendChild(li);
    });
}
