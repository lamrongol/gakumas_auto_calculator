//Declare constant value
////amount when perfect
const THIRD_TO_LAST_LESSON_AMOUNT_BASE = 120;
const THIRD_TO_LAST_SP_AMOUNT_BASE = 200;
const SECOND_TO_LAST_LESSON_AMOUNT_BASE = 150;
const SECOND_TO_LAST_SP_AMOUNT_BASE = 220;
const OIKOMI_CLEAR_AMOUNT = 165;
const OIKOMI_PERFECT_EACH_AMOUNT = 145;

let THIRD_TO_LAST_LESSON_AMOUNT;
let THIRD_TO_LAST_SP_AMOUNT;
let SECOND_TO_LAST_LESSON_AMOUNT;
let SECOND_TO_LAST_SP_AMOUNT;

let PARAMETER_LIMIT;

const PARAMETER_NAMES = Object.freeze(["vocal", "dance", "visual"]);
const WEEK_ORDER = Object.freeze(["primary", "third_to_last", "second_to_last", "last"]);
const WEEK_DETAIL = Object.freeze(new Map(
    [
        ["primary", 0],
        ["third_to_last", 1],
        ["second_to_last", 2],
        ["last", 3],
    ]));

//@see 最終プロデュース評価 - 学園アイドルマスターwiki (学マスwiki) https://seesaawiki.jp/gakumasu/d/%BA%C7%BD%AA%A5%D7%A5%ED%A5%C7%A5%E5%A1%BC%A5%B9%C9%BE%B2%C1
//     BORDER S: 13000, A+: 11500, A: 10000 //(S+: 14500)
const RANK_EVALUATION_BORDERS = Object.freeze(new Map(
    [
        ["a", 10000],//A
        ["a_plus", 11500],//A+
        ["s", 13000],//S
        ["s_plus", 14500]//S+
    ]
));
const SCORE_RATES = Object.freeze(new Map(
    [
        [5000, { rate: 0.30, max: 1500 }],
        [10000, { rate: 0.15, max: 750 }],
        [20000, { rate: 0.08, max: 800 }],
        [30000, { rate: 0.04, max: 400 }],
        [40000, { rate: 0.02, max: 200 }],
        [50000, { rate: 0.01, max: Number.POSITIVE_INFINITY }], //last
    ]
));

const PREPARED_LANG_SET = new Set(["ja", "en"]);

let translations;
const loadLanguage = (lang) => {
    if (!PREPARED_LANG_SET.has(lang)) lang = "ja";

    fetch(`./lang/${lang}.json`)
        .then(response => {
            if (!response.ok) {
                throw new Error(response.status);
            }
            return response.json();
        })
        .then(data => {
            translations = data;
            document.querySelectorAll('[localization-key]').forEach((element) => {
                const key = element.getAttribute('localization-key');
                const translated = translations[key];
                element.innerHTML = translated;
            });

            document.title.innerText = translations["title"];
        })
        .catch(error => console.error('Error loading language file:', error));
}

window.onload = () => {
    const lang = window.navigator.language.substring(0, 2);
    loadLanguage(lang);

    const form = document.forms.mainForm;

    const primary_vocal = document.getElementById("primary_vocal");
    const primary_dance = document.getElementById("primary_dance");
    const primary_visual = document.getElementById("primary_visual");
    const vocal_bonus = document.getElementById("vocal_bonus");
    const dance_bonus = document.getElementById("dance_bonus");
    const visual_bonus = document.getElementById("visual_bonus");

    const third_to_last_vocal = document.getElementById("third_to_last_vocal");
    const third_to_last_dance = document.getElementById("third_to_last_dance");
    const third_to_last_visual = document.getElementById("third_to_last_visual");

    const second_to_last_vocal = document.getElementById("second_to_last_vocal");
    const second_to_last_dance = document.getElementById("second_to_last_dance");
    const second_to_last_visual = document.getElementById("second_to_last_visual");

    const last_vocal = document.getElementById("last_vocal");
    const last_dance = document.getElementById("last_dance");
    const last_visual = document.getElementById("last_visual");

    const get_as_number = (input_id) => {
        return Number(document.getElementById(input_id).value);
    }

    const get_lesson_kind = (radio) => {
        const value = radio.value;
        const sp = value.substring(0, 3) == "sp_";
        const parameter_name = sp ? value.substring(3) : value;

        return [parameter_name, sp];
    }

    const calc_amount = (original, bonus) => original + Math.floor(original * bonus / 100.0);
    const auto_calculate_parameter = (evt) => {
        const name = evt.currentTarget.name;
        const week_name = name.substring(0, name.length - 7);
        const idx = WEEK_DETAIL.get(week_name);
        const start_week = WEEK_ORDER[idx - 1]
        calculate_parameter(start_week);
    }

    const calc_lesson_parameter = () => {
        const lesson_limit_up_amount = get_as_number("lesson_limit_up");
        THIRD_TO_LAST_LESSON_AMOUNT = THIRD_TO_LAST_LESSON_AMOUNT_BASE + lesson_limit_up_amount;
        THIRD_TO_LAST_SP_AMOUNT = THIRD_TO_LAST_SP_AMOUNT_BASE + lesson_limit_up_amount;
        SECOND_TO_LAST_LESSON_AMOUNT = SECOND_TO_LAST_LESSON_AMOUNT_BASE + lesson_limit_up_amount;
        SECOND_TO_LAST_SP_AMOUNT = SECOND_TO_LAST_SP_AMOUNT_BASE + lesson_limit_up_amount;
    }
    const lesson_limit_up = document.getElementById("lesson_limit_up");
    lesson_limit_up.addEventListener("input", calc_lesson_parameter);
    const difficulty_change = (difficulty_level) => {
        if (difficulty_level == "pro") {
            PARAMETER_LIMIT = 1500;
            lesson_limit_up.disabled = true;
            lesson_limit_up.placeholder = "-";

            THIRD_TO_LAST_LESSON_AMOUNT = THIRD_TO_LAST_LESSON_AMOUNT_BASE;
            THIRD_TO_LAST_SP_AMOUNT = THIRD_TO_LAST_SP_AMOUNT_BASE;
            SECOND_TO_LAST_LESSON_AMOUNT = SECOND_TO_LAST_LESSON_AMOUNT_BASE;
            SECOND_TO_LAST_SP_AMOUNT = SECOND_TO_LAST_SP_AMOUNT_BASE;
        } else {
            PARAMETER_LIMIT = 1800;
            lesson_limit_up.disabled = false;
            lesson_limit_up.placeholder = "000";

            calc_lesson_parameter();
        }

        window.sessionStorage.setItem("difficulty_level", difficulty_level);
    };

    document.getElementsByName('difficulty').forEach(input => {
        input.addEventListener("change", (evt) => {
            difficulty_change(evt.currentTarget.value);
        });
    });
    //difficulty level
    let difficulty_level = window.sessionStorage.getItem("difficulty_level");
    if (difficulty_level == null) difficulty_level = "pro";//first
    document.getElementById("difficulty_" + difficulty_level).checked = true;
    difficulty_change(difficulty_level);

    const calculate_parameter = (start_week = "primary") => {
        const start_idx = WEEK_DETAIL.get(start_week);

        const parameters = {
            "vocal": get_as_number(start_week + "_vocal"),
            "vocal_bonus": get_as_number("vocal_bonus"),
            "dance": get_as_number(start_week + "_dance"),
            "dance_bonus": get_as_number("dance_bonus"),
            "visual": get_as_number(start_week + "_visual"),
            "visual_bonus": get_as_number("visual_bonus")
        }

        //last 4 week
        if (start_idx < WEEK_DETAIL.get("third_to_last")) {
            const [chosen_parameter, sp] = get_lesson_kind(form.third_to_last_lesson);
            const amount = sp ? THIRD_TO_LAST_SP_AMOUNT : THIRD_TO_LAST_LESSON_AMOUNT;
            parameters[chosen_parameter] += calc_amount(amount, parameters[chosen_parameter + "_bonus"]);

            third_to_last_vocal.value = parameters["vocal"];
            third_to_last_dance.value = parameters["dance"];
            third_to_last_visual.value = parameters["visual"];
        }

        //last 3 week
        if (start_idx < WEEK_DETAIL.get("second_to_last")) {
            const [chosen_parameter, sp] = get_lesson_kind(form.second_to_last_lesson);
            const amount = sp ? SECOND_TO_LAST_SP_AMOUNT : SECOND_TO_LAST_LESSON_AMOUNT;
            parameters[chosen_parameter] += calc_amount(amount, parameters[chosen_parameter + "_bonus"]);

            second_to_last_vocal.value = parameters["vocal"];
            second_to_last_dance.value = parameters["dance"];
            second_to_last_visual.value = parameters["visual"];
        }

        //oikomi
        if (start_idx < WEEK_DETAIL.get("last")) {
            const chosen_parameter = form.last_lesson.value;
            parameters[chosen_parameter] += calc_amount(OIKOMI_CLEAR_AMOUNT, parameters[chosen_parameter + "_bonus"]);
            PARAMETER_NAMES.forEach(param => {
                parameters[param] += calc_amount(OIKOMI_PERFECT_EACH_AMOUNT, parameters[param + "_bonus"]);
            })
            last_vocal.value = parameters["vocal"];
            last_dance.value = parameters["dance"];
            last_visual.value = parameters["visual"];
        }

        //final
        let sum_param = 0;
        PARAMETER_NAMES.forEach(name => {
            parameters[name] += 30;
            if (parameters[name] > PARAMETER_LIMIT) {
                parameters.is_over = true;
                parameters[name] = PARAMETER_LIMIT;
            }
            sum_param += parameters[name];
        })

        PARAMETER_NAMES.forEach(param => {
            document.getElementById("final_" + param).innerText = parameters[param];
        });
        // document.getElementById("parameter_sum").innerText = sum_param;
        calc_required_scores(sum_param);
    }

    const calc_required_scores = (sum_param) => {
        let required_scores = {};

        const param_evaluation = Math.floor(2.3 * sum_param);
        const init_evaluation = param_evaluation + 1700 /* Getting No.1 */;

        for (const [rank, rank_border] of RANK_EVALUATION_BORDERS) {
            let evaluation = init_evaluation;
            if (evaluation >= rank_border) {
                required_scores[rank] = 0;
                continue;
            }

            let required_score = 0;
            for (const [score_boundary, detail] of SCORE_RATES) {
                const tmp = evaluation + detail.max;
                if (tmp < rank_border) {
                    evaluation = tmp;
                    required_score = score_boundary;
                    continue;
                } else {
                    const left_required_evaluation = rank_border - evaluation;
                    const left_required_score = Math.ceil(left_required_evaluation / detail.rate);
                    required_scores[rank] = required_score + left_required_score;
                    break;
                    //TODO loop by every rank needs duplicate calculation but this prior simplicity of code. 
                }
            }
            document.getElementById(rank + "_score").innerText = required_scores[rank];
            document.getElementById("_" + rank + "_score").innerText = required_scores[rank];
            document.getElementById(rank + "_param").innerText = param_evaluation +
                "(" + Math.round(param_evaluation / rank_border * 100) + "%)";
            document.getElementById(rank + "_test").innerText = (rank_border - init_evaluation) +
                "(" + Math.round((rank_border - init_evaluation) / rank_border * 100) + "%)";
            document.getElementById(rank + "_pos_rate").innerText = "(" + Math.round(1700 / rank_border * 100) + "%)";
        }
        //debug.innerText = required_scores["s"]

        return;
    };

    const auto_select_evt = (evt) => {
        auto_select(evt.currentTarget.name);
    };

    const auto_select = (start_week) => {
        const start_idx = WEEK_DETAIL.get(start_week);
        if (start_week == "last") {
            calculate_parameter(start_week);
            return;
        }

        document.querySelectorAll('input[type="radio"]').forEach(radio => {
            radio.removeEventListener("change", auto_calculate_parameter);
        });

        const prior_parameters = Array.from(PARAMETER_NAMES)
            .sort((a, b) => get_as_number(b + "_bonus") - get_as_number(a + "_bonus"));

        const prior_param = prior_parameters[0];
        const prior_param_init_value = get_as_number(start_week + "_" + prior_param) + 30;//+30 When getting a No.1;
        const prior_param_bonus = get_as_number(prior_param + "_bonus");
        const second_param = prior_parameters[1];

        let prior_value = prior_param_init_value;
        //oikomi
        if (start_idx < WEEK_DETAIL.get("last")) {
            const tmp = prior_value + calc_amount(OIKOMI_CLEAR_AMOUNT, prior_param_bonus) + calc_amount(OIKOMI_PERFECT_EACH_AMOUNT, prior_param_bonus);
            //Some events will raise parameters so set 100 safety margin.
            if (tmp > PARAMETER_LIMIT - 30) {
                document.getElementById("last_lesson_" + second_param).checked = true;
            } else {
                document.getElementById("last_lesson_" + prior_param).checked = true;
                prior_value = tmp;
            }
        }
        //last 3 week
        if (start_idx < WEEK_DETAIL.get("second_to_last")) {
            const tmp = prior_value + calc_amount(SECOND_TO_LAST_SP_AMOUNT, prior_param_bonus);
            //Some events will raise parameters so set 70 safety margin.
            if (tmp > PARAMETER_LIMIT - 60) {
                document.getElementById("second_to_last_lesson_sp_" + second_param).checked = true;
            } else {
                document.getElementById("second_to_last_lesson_sp_" + prior_param).checked = true;
                prior_value = tmp;
            }
        }
        //last 4 week
        if (start_idx < WEEK_DETAIL.get("third_to_last")) {
            const tmp = prior_value + calc_amount(THIRD_TO_LAST_SP_AMOUNT, prior_param_bonus);
            //Some events will raise parameters so set 30 safety margin.
            if (tmp > PARAMETER_LIMIT - 100) {
                document.getElementById("third_to_last_lesson_sp_" + second_param).checked = true;
            } else {
                document.getElementById("third_to_last_lesson_sp_" + prior_param).checked = true;
            }
        }

        //Set event again
        document.querySelectorAll('input[type="radio"]').forEach(radio => {
            radio.addEventListener("change", auto_calculate_parameter);
        });


        calculate_parameter(start_week);
    }

    document.getElementById("reset").addEventListener("click", (_evt) => {
        document.querySelectorAll(".auto_calculated").forEach((elm) => elm.innerText = "");
    })
    //auto_select
    document.querySelectorAll('input[type="number"]').forEach(input => {
        input.addEventListener("click", (evt) => {
            evt.target.select();
        });
        input.addEventListener("input", auto_select_evt);
    });
    //auto_calculate
    document.querySelectorAll('input[type="radio"]').forEach(radio => {
        radio.addEventListener("change", auto_calculate_parameter);
    });

    ////Settings
    //is_detail_open
    let is_detail_open = window.sessionStorage.getItem("is_detail_open");
    //string -> boolean
    if (is_detail_open == null) is_detail_open = true;//first
    else is_detail_open = (is_detail_open == "true")

    const score_detail = document.getElementById("score_detail");
    score_detail.toggleAttribute("open", is_detail_open);
    score_detail.addEventListener("toggle", (_event) => {
        window.sessionStorage.setItem("is_detail_open", score_detail.open);
    });

    const auto_select_checkbox = document.getElementById("auto_select");
    auto_select_checkbox.addEventListener("change", () => {
        if (auto_select_checkbox.checked) {
            document.querySelectorAll('input[type="number"]').forEach(input => {
                input.removeEventListener("input", auto_calculate_parameter);
                input.addEventListener("input", auto_select_evt);
            });
            //auto_select("primary");
        } else {
            document.querySelectorAll('input[type="number"]').forEach(input => {
                input.removeEventListener("input", auto_select_evt);
                input.addEventListener("input", auto_calculate_parameter);
            });
        }
    });
}
