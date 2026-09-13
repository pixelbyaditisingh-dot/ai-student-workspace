/**
 * Learnly Mock Data Store
 * Provides realistic academic datasets for dashboard, recent activity, notes, and quizzes.
 */

const LEARNLY_MOCK_DATA = {
  user: {
    name: "Aditi Singh",
    initials: "AS",
    role: "CS Student",
    streakDays: 5,
    avatarColor: "linear-gradient(135deg, #6366f1, #8b5cf6)"
  },

  dashboardMetrics: [
    {
      id: "total-lectures",
      title: "Total Lectures",
      value: "14",
      unit: "Uploaded",
      change: "+3 this week",
      isPositive: true,
      icon: `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1-2.5-2.5Z"></path><path d="M6 6h10"></path><path d="M6 10h10"></path><path d="M12 18l3-3-3-3"></path></svg>`,
      color: "#6366f1"
    },
    {
      id: "notes-generated",
      title: "Notes Generated",
      value: "42",
      unit: "Topics",
      change: "+12 key concepts",
      isPositive: true,
      icon: `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path></svg>`,
      color: "#8b5cf6"
    },
    {
      id: "quizzes-completed",
      title: "Quizzes Completed",
      value: "18",
      unit: "Quizzes",
      change: "92% average score",
      isPositive: true,
      icon: `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><path d="m9 12 2 2 4-4"></path></svg>`,
      color: "#10b981"
    },
    {
      id: "current-streak",
      title: "Current Day Streak",
      value: "5 Days 🔥",
      unit: "Active",
      change: "Top 10% consistency",
      isPositive: true,
      icon: `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"></path></svg>`,
      color: "#f59e0b"
    }
  ],

  recentLectures: [
    {
      id: "lec-1",
      filename: "CS480_Machine_Learning_Lecture4.pdf",
      title: "Introduction to Supervised ML & Gradient Descent",
      subject: "Computer Science",
      subjectColor: "#6366f1",
      date: "Today, 10:30 AM",
      wordCount: 1420,
      readingTime: "6 min read",
      status: "Ready",
      notes: {
        title: "Introduction to Supervised Machine Learning & Optimization",
        subject: "CS 480: Artificial Intelligence",
        overview: "This lecture introduces the core foundations of supervised machine learning, where algorithms learn mappings from labeled training pairs. It delves deeply into linear regression, the Mean Squared Error (MSE) cost function, iterative optimization via gradient descent, and the fundamental bias-variance trade-off.",
        keyConcepts: [
          {
            term: "Hypothesis Function",
            definition: "The parameterized mathematical model h_theta(x) that maps input feature vectors to predicted target values.",
            category: "Core Principle"
          },
          {
            term: "Cost Function (MSE)",
            definition: "The average squared difference between predictions and actual labels across all m training examples.",
            category: "Mathematical Model"
          },
          {
            term: "Learning Rate (alpha)",
            definition: "A crucial hyperparameter controlling the step size taken in the direction of steepest descent during optimization.",
            category: "Hyperparameter"
          },
          {
            term: "Bias-Variance Tradeoff",
            definition: "The fundamental tension between underfitting (high bias, overly simple) and overfitting (high variance, noisy generalization).",
            category: "Theory"
          }
        ],
        revisionNotes: [
          {
            section: "1. The Supervised Learning Framework",
            summary: "Supervised learning utilizes labeled pairs (x, y) to infer a predictive hypothesis function.",
            points: [
              "Training dataset consists of m examples with n-dimensional feature vectors.",
              "Loss quantifies error on a single instance; Cost function J(theta) aggregates loss over the entire dataset.",
              "The objective is to minimize J(theta) with respect to model parameters theta."
            ]
          },
          {
            section: "2. Gradient Descent Optimization",
            summary: "An iterative first-order algorithm that updates parameters opposite to the gradient vector.",
            points: [
              "Update rule: theta_j := theta_j - alpha * (d/d_theta_j) J(theta).",
              "Small alpha leads to slow convergence; excessively large alpha causes oscillations or divergence.",
              "Convergence is reached when the gradient magnitude approaches zero."
            ]
          },
          {
            section: "3. Generalization & Regularization",
            summary: "Preventing overfitting ensures robust predictive accuracy on unseen test data.",
            points: [
              "Overfitting occurs when the model captures idiosyncratic dataset noise.",
              "L1 (Lasso) promotes parameter sparsity; L2 (Ridge) shrinks weight magnitudes towards zero.",
              "Cross-validation is standard practice to evaluate out-of-sample error."
            ]
          }
        ],
        takeaways: [
          "Master the formulation of the MSE cost function and its partial derivatives.",
          "Tune the learning rate alpha carefully to balance convergence speed and stability.",
          "Use regularization (L1/L2) whenever model complexity exceeds the data sample size.",
          "Always validate on a held-out test split to detect overfitting early."
        ]
      },
      quiz: [
        {
          id: 1,
          question: "What happens during Gradient Descent if the learning rate (alpha) is set too high?",
          options: [
            { id: "A", text: "The algorithm will guarantee global convergence in fewer iterations." },
            { id: "B", text: "The parameter updates may overshoot the minimum and fail to converge or diverge." },
            { id: "C", text: "The model automatically switches from linear to logistic regression." },
            { id: "D", text: "The cost function is permanently fixed to zero." }
          ],
          correctOption: "B",
          explanation: "When alpha is too large, the step size overshoots the minimum point of the cost function bowl, leading to oscillation or divergence.",
          conceptTested: "Gradient Descent Optimization"
        },
        {
          id: 2,
          question: "Which scenario is characteristic of high variance (overfitting)?",
          options: [
            { id: "A", text: "Near-zero training error but significantly higher test error on unseen data." },
            { id: "B", text: "High error on both the training set and the test set." },
            { id: "C", text: "A straight line fitted to complex sinusoidal data." },
            { id: "D", text: "The complete absence of hyperparameters in the hypothesis function." }
          ],
          correctOption: "A",
          explanation: "High variance means the model has memorized the training noise, performing exceptionally on training data but failing to generalize.",
          conceptTested: "Bias-Variance Tradeoff"
        },
        {
          id: 3,
          question: "What is the primary role of the Hypothesis Function h_theta(x)?",
          options: [
            { id: "A", text: "To normalize the input dataset to have zero mean and unit variance." },
            { id: "B", text: "To map input features to predicted output values based on parameter weights." },
            { id: "C", text: "To compute the derivative of the regularization penalty." },
            { id: "D", text: "To split the dataset into 80/20 train/test splits automatically." }
          ],
          correctOption: "B",
          explanation: "The hypothesis function represents the mathematical mapping h_theta(x) that makes predictions given feature vector x.",
          conceptTested: "Supervised Learning Paradigm"
        },
        {
          id: 4,
          question: "How does L2 Regularization (Ridge) help prevent overfitting?",
          options: [
            { id: "A", text: "By setting most parameters to exactly zero to create sparse models." },
            { id: "B", text: "By penalizing large weight values, keeping parameter values small and smooth." },
            { id: "C", text: "By multiplying the learning rate by a random noise vector." },
            { id: "D", text: "By removing 50% of the training features randomly." }
          ],
          correctOption: "B",
          explanation: "L2 regularization adds a penalty proportional to the sum of squared weights, preventing any single weight from dominating.",
          conceptTested: "Regularization"
        },
        {
          id: 5,
          question: "Which metric is most appropriate for evaluating a continuous scalar regression model?",
          options: [
            { id: "A", text: "Mean Squared Error (MSE) / Root Mean Squared Error (RMSE)" },
            { id: "B", text: "Confusion Matrix Accuracy" },
            { id: "C", text: "ROC-AUC Classification Curve" },
            { id: "D", text: "Perplexity Score" }
          ],
          correctOption: "A",
          explanation: "MSE and RMSE directly measure the magnitude of prediction error on continuous target variables in regression tasks.",
          conceptTested: "Evaluation Metrics"
        }
      ]
    },
    {
      id: "lec-2",
      filename: "BIO110_Cellular_Respiration_ATP.pdf",
      title: "Cellular Respiration, Glycolysis & ATP Synthesis",
      subject: "Biology",
      subjectColor: "#10b981",
      date: "Yesterday, 3:45 PM",
      wordCount: 1890,
      readingTime: "8 min read",
      status: "Ready",
      notes: {
        title: "Cellular Respiration, Glycolysis & ATP Synthesis",
        subject: "BIO 110: Principles of Cellular Biology",
        overview: "A comprehensive breakdown of aerobic cellular respiration: converting nutrient energy into ATP through Glycolysis, the Citric Acid (Krebs) Cycle, and Oxidative Phosphorylation.",
        keyConcepts: [
          {
            term: "Glycolysis",
            definition: "The anaerobic breakdown of 1 glucose (6C) into 2 pyruvate (3C) molecules in the cytoplasm, yielding 2 net ATP and 2 NADH.",
            category: "Metabolic Pathway"
          },
          {
            term: "ATP Synthase",
            definition: "The molecular rotary enzyme that uses a proton-motive force across the inner mitochondrial membrane to synthesize ATP from ADP and Pi.",
            category: "Enzyme / Complex"
          },
          {
            term: "Electron Transport Chain",
            definition: "A series of multi-protein electron carriers in the inner mitochondrial membrane that pump H+ ions into the intermembrane space.",
            category: "Mechanism"
          },
          {
            term: "Terminal Electron Acceptor",
            definition: "Molecular oxygen (O2), which accepts electrons at Complex IV and combines with protons to form water (H2O).",
            category: "Chemical Reaction"
          }
        ],
        revisionNotes: [
          {
            section: "1. Metabolic Stages of Respiration",
            summary: "Respiration yields ~30-32 ATP per glucose via three interconnected stages.",
            points: [
              "Stage 1: Glycolysis (Cytoplasm) - Anaerobic, nets 2 ATP + 2 NADH.",
              "Stage 2: Pyruvate Oxidation & Citric Acid Cycle (Mitochondrial Matrix).",
              "Stage 3: Oxidative Phosphorylation (Inner Mitochondrial Membrane) - Generates ~90% of total ATP."
            ]
          },
          {
            section: "2. Chemiosmosis & The Proton Gradient",
            summary: "The proton electrochemical gradient drives ATP synthesis through mechanical rotation.",
            points: [
              "NADH (pumps 10 H+) and FADH2 (pumps 6 H+) donate electrons to ETC complexes.",
              "Protons accumulate in the intermembrane space creating an electrochemical gradient.",
              "Protons flow down through ATP Synthase, rotating its catalytic subunit to produce ATP."
            ]
          }
        ],
        takeaways: [
          "Understand the cellular locations of each of the three respiration stages.",
          "Trace the electron path from glucose -> NADH/FADH2 -> ETC -> Oxygen (forming H2O).",
          "Remember that oxygen is the final electron acceptor in aerobic respiration.",
          "Oxidative phosphorylation produces the vast majority of cellular ATP."
        ]
      },
      quiz: [
        {
          id: 1,
          question: "Where in the eukaryotic cell does Glycolysis take place?",
          options: [
            { id: "A", text: "Mitochondrial Matrix" },
            { id: "B", text: "Cytoplasm (Cytosol)" },
            { id: "C", text: "Inner Mitochondrial Membrane" },
            { id: "D", text: "Endoplasmic Reticulum" }
          ],
          correctOption: "B",
          explanation: "Glycolysis takes place in the cytoplasm and does not require oxygen or mitochondrial machinery.",
          conceptTested: "Glycolysis Location"
        },
        {
          id: 2,
          question: "What is the net yield of ATP molecules per glucose directly from Glycolysis?",
          options: [
            { id: "A", text: "32 ATP" },
            { id: "B", text: "2 Net ATP (4 produced minus 2 invested)" },
            { id: "C", text: "0 ATP" },
            { id: "D", text: "6 Net ATP" }
          ],
          correctOption: "B",
          explanation: "Glycolysis consumes 2 ATP during the investment phase and generates 4 ATP in the payoff phase, yielding a net 2 ATP.",
          conceptTested: "Glycolysis Energy Balance"
        },
        {
          id: 3,
          question: "What acts as the terminal electron acceptor in the mitochondrial electron transport chain?",
          options: [
            { id: "A", text: "Carbon Dioxide (CO2)" },
            { id: "B", text: "Molecular Oxygen (O2)" },
            { id: "C", text: "Pyruvate" },
            { id: "D", text: "Glucose" }
          ],
          correctOption: "B",
          explanation: "Oxygen (O2) is the terminal electron acceptor, binding electrons and protons to produce metabolic water (H2O).",
          conceptTested: "Electron Transport Chain"
        },
        {
          id: 4,
          question: "What directly drives the catalytic rotation of ATP Synthase?",
          options: [
            { id: "A", text: "The flow of protons (H+) down their electrochemical gradient into the matrix" },
            { id: "B", text: "Direct ATP hydrolysis in the outer membrane" },
            { id: "C", text: "Glucose molecules binding to the active site" },
            { id: "D", text: "Sunlight photons exciting electrons" }
          ],
          correctOption: "A",
          explanation: "Chemiosmosis: the proton motive force drives H+ through the Fo channel of ATP Synthase, rotating the enzyme to synthesize ATP.",
          conceptTested: "ATP Synthase Mechanism"
        },
        {
          id: 5,
          question: "Which stage of cellular respiration produces the largest quantity of ATP?",
          options: [
            { id: "A", text: "Oxidative Phosphorylation" },
            { id: "B", text: "Glycolysis" },
            { id: "C", text: "Pyruvate Oxidation" },
            { id: "D", text: "Fermentation" }
          ],
          correctOption: "A",
          explanation: "Oxidative phosphorylation generates ~26-28 of the total ~30-32 ATP produced per glucose molecule.",
          conceptTested: "Respiration Yield"
        }
      ]
    },
    {
      id: "lec-3",
      filename: "ECON201_Macroeconomics_Inflation.txt",
      title: "Monetary Policy, Central Banking & Inflation",
      subject: "Economics",
      subjectColor: "#f59e0b",
      date: "Sep 10, 2026",
      wordCount: 1250,
      readingTime: "5 min read",
      status: "Ready",
      notes: {
        title: "Monetary Policy, Central Banking & Inflation Dynamics",
        subject: "ECON 201: Principles of Macroeconomics",
        overview: "Examines how central banks manipulate short-term interest rates, open market operations, and reserve requirements to manage economic growth, stabilize inflation targets, and avoid liquidity traps.",
        keyConcepts: [
          {
            term: "Federal Funds Rate",
            definition: "The target interest rate at which commercial depository institutions borrow and lend reserve balances to each other overnight.",
            category: "Policy Tool"
          },
          {
            term: "Quantitative Easing (QE)",
            definition: "An unconventional monetary policy tool where central banks purchase longer-term securities to inject liquidity directly into the banking system.",
            category: "Central Banking"
          },
          {
            term: "Phillips Curve",
            definition: "The economic model describing an inverse relationship between rates of unemployment and corresponding rates of inflation.",
            category: "Macro Theory"
          },
          {
            term: "Open Market Operations",
            definition: "The buying and selling of government securities in the open market by a central bank to expand or contract the amount of money in the system.",
            category: "Mechanism"
          }
        ],
        revisionNotes: [
          {
            section: "1. Tools of Monetary Policy",
            summary: "Central banks influence money supply and credit conditions through interest rates, reserve ratios, and open market operations.",
            points: [
              "Lowering interest rates stimulates borrowing, capital investment, and consumer demand.",
              "Raising rates cools over-heated inflationary pressures.",
              "Open market bond purchases expand the money supply."
            ]
          },
          {
            section: "2. Inflation Mandates & Price Stability",
            summary: "Most modern central banks maintain a 2% annualized core inflation target to prevent deflationary spirals.",
            points: [
              "Demand-pull inflation arises from aggregate demand exceeding productive capacity.",
              "Cost-push inflation stems from supply shocks in energy or commodities.",
              "Inflation expectations heavily influence wage negotiations and long-term contracts."
            ]
          }
        ],
        takeaways: [
          "Differentiate between contractionary and expansionary monetary policy.",
          "Understand the relationship between interest rates, bond yields, and aggregate demand.",
          "Identify the primary drivers of demand-pull versus cost-push inflation."
        ]
      },
      quiz: [
        {
          id: 1,
          question: "When a central bank increases interest rates, what is the expected effect on consumer borrowing?",
          options: [
            { id: "A", text: "Consumer borrowing typically decreases due to higher credit costs." },
            { id: "B", text: "Consumer borrowing increases exponentially." },
            { id: "C", text: "There is no economic correlation between rates and borrowing." },
            { id: "D", text: "Money supply immediately doubles." }
          ],
          correctOption: "A",
          explanation: "Higher interest rates increase the cost of financing loans and mortgages, dampening consumer demand.",
          conceptTested: "Monetary Policy Impact"
        },
        {
          id: 2,
          question: "What is the primary objective of Quantitative Easing (QE)?",
          options: [
            { id: "A", text: "To reduce commercial bank reserves to zero." },
            { id: "B", text: "To inject liquidity into the economy and lower long-term interest rates." },
            { id: "C", text: "To eliminate all income tax nationwide." },
            { id: "D", text: "To halt international currency trading." }
          ],
          correctOption: "B",
          explanation: "Quantitative Easing lowers yields on long-term bonds and stimulates lending when short-term rates are near zero.",
          conceptTested: "Quantitative Easing"
        },
        {
          id: 3,
          question: "According to the traditional short-run Phillips Curve, what happens when unemployment decreases?",
          options: [
            { id: "A", text: "Inflation tends to increase due to wage and demand pressures." },
            { id: "B", text: "Inflation permanently falls to zero." },
            { id: "C", text: "Stock prices collapse instantly." },
            { id: "D", text: "Central banks are dissolved." }
          ],
          correctOption: "A",
          explanation: "The short-run Phillips curve shows a trade-off: lower unemployment puts upward pressure on wages and inflation.",
          conceptTested: "Phillips Curve"
        },
        {
          id: 4,
          question: "Which scenario represents 'Cost-Push' inflation?",
          options: [
            { id: "A", text: "A sudden spike in global crude oil prices increasing transportation and manufacturing costs." },
            { id: "B", text: "Excessive consumer stimulus driving up luxury electronics sales." },
            { id: "C", text: "A dramatic decrease in corporate tax rates." },
            { id: "D", text: "A continuous drop in import tariffs." }
          ],
          correctOption: "A",
          explanation: "Cost-push inflation occurs when production costs increase (e.g. energy shocks), shifting aggregate supply inward.",
          conceptTested: "Cost-Push Inflation"
        },
        {
          id: 5,
          question: "Why do central banks target a positive inflation rate (e.g. 2%) rather than 0%?",
          options: [
            { id: "A", text: "To provide a safety buffer against deflationary spirals and give room for real interest rate cuts." },
            { id: "B", text: "Because 0% inflation is mathematically impossible to measure." },
            { id: "C", text: "To rapidly devalue student savings." },
            { id: "D", text: "Because high inflation automatically fixes trade deficits." }
          ],
          correctOption: "A",
          explanation: "A small positive inflation buffer prevents deflation, which can cause consumers to postpone purchases and trigger recessions.",
          conceptTested: "Inflation Targeting"
        }
      ]
    },
    {
      id: "lec-4",
      filename: "CHEM102_Thermodynamics_Kinetics.pdf",
      title: "Chemical Kinetics, Reaction Rates & Activation Energy",
      subject: "Chemistry",
      subjectColor: "#ec4899",
      date: "Sep 8, 2026",
      wordCount: 1650,
      readingTime: "7 min read",
      status: "Ready",
      notes: {
        title: "Chemical Kinetics & Reaction Mechanisms",
        subject: "CHEM 102: General Chemistry II",
        overview: "An introduction to reaction rates, collision theory, rate laws, the Arrhenius equation, and catalyst mechanisms in chemical systems.",
        keyConcepts: [
          {
            term: "Activation Energy (Ea)",
            definition: "The minimum kinetic energy reacting molecules must possess upon collision to form the transition state.",
            category: "Kinetics"
          },
          {
            term: "Rate-Determining Step",
            definition: "The slowest elementary step in a multi-step reaction mechanism that limits the overall reaction velocity.",
            category: "Mechanism"
          },
          {
            term: "Arrhenius Equation",
            definition: "Mathematical relationship k = A * exp(-Ea / RT) showing the temperature dependence of reaction rate constants.",
            category: "Formula"
          },
          {
            term: "Homogeneous Catalyst",
            definition: "A catalyst that exists in the exact same phase of matter (e.g., aqueous solution) as the reacting species.",
            category: "Catalysis"
          }
        ],
        revisionNotes: [
          {
            section: "1. Collision Theory & Temperature Effects",
            summary: "Reactions occur when reactant particles collide with sufficient energy (E >= Ea) and correct steric orientation.",
            points: [
              "Increasing temperature increases average kinetic energy and the fraction of collisions exceeding Ea.",
              "The Arrhenius equation quantifies rate constant sensitivity to temperature.",
              "Steric factors account for proper molecular orientation during impact."
            ]
          },
          {
            section: "2. Catalysts & Reaction Mechanisms",
            summary: "Catalysts provide alternative reaction pathways with reduced activation energy barriers.",
            points: [
              "Catalysts increase reaction rate without being consumed in the net reaction.",
              "Catalysts lower both forward and reverse activation energies equally, leaving equilibrium constant K unchanged.",
              "Enzymes are highly specific biological catalysts with active sites."
            ]
          }
        ],
        takeaways: [
          "Catalysts lower Ea without changing delta-H or equilibrium constant K_eq.",
          "The rate-determining step dictates the experimental rate law.",
          "Know how to extract Ea from an Arrhenius plot of ln(k) versus 1/T."
        ]
      },
      quiz: [
        {
          id: 1,
          question: "How does an enzyme or chemical catalyst accelerate a chemical reaction?",
          options: [
            { id: "A", text: "By lowering the activation energy barrier for the reaction pathway." },
            { id: "B", text: "By increasing the temperature of the entire solution." },
            { id: "C", text: "By changing the chemical equilibrium constant K_eq." },
            { id: "D", text: "By consuming all reactant mass permanently." }
          ],
          correctOption: "A",
          explanation: "Catalysts provide an alternative reaction pathway with lower activation energy, allowing more molecules to react per unit time.",
          conceptTested: "Catalysis Mechanism"
        },
        {
          id: 2,
          question: "In a multi-step reaction mechanism, which step dictates the overall rate law?",
          options: [
            { id: "A", text: "The fastest elementary step." },
            { id: "B", text: "The slowest step (the Rate-Determining Step)." },
            { id: "C", text: "The final step where products are collected." },
            { id: "D", text: "Every step equally regardless of rate." }
          ],
          correctOption: "B",
          explanation: "The rate-determining step is the bottleneck of the reaction sequence and limits the overall speed of product formation.",
          conceptTested: "Reaction Mechanisms"
        },
        {
          id: 3,
          question: "What is plotted on the x-axis and y-axis in an Arrhenius Plot to calculate activation energy (Ea)?",
          options: [
            { id: "A", text: "ln(k) on y-axis versus (1/T) in Kelvin on x-axis." },
            { id: "B", text: "Concentration on y-axis versus Time on x-axis." },
            { id: "C", text: "pH on y-axis versus Temperature in Celsius on x-axis." },
            { id: "D", text: "Pressure on y-axis versus Volume on x-axis." }
          ],
          correctOption: "A",
          explanation: "From ln(k) = -Ea/R * (1/T) + ln(A), the slope of ln(k) vs 1/T equals -Ea / R.",
          conceptTested: "Arrhenius Equation"
        },
        {
          id: 4,
          question: "What effect does adding a catalyst have on the enthalpy change (delta-H) of a reaction?",
          options: [
            { id: "A", text: "It has zero effect; delta-H is a state function and remains identical." },
            { id: "B", text: "It doubles delta-H, making it twice as exothermic." },
            { id: "C", text: "It converts exothermic reactions into endothermic reactions." },
            { id: "D", text: "It reduces delta-H to absolute zero." }
          ],
          correctOption: "A",
          explanation: "Enthalpy depends only on initial reactant and final product states; catalysts alter kinetics, not thermodynamics.",
          conceptTested: "Thermodynamics vs Kinetics"
        },
        {
          id: 5,
          question: "According to collision theory, what two criteria are required for an effective reaction collision?",
          options: [
            { id: "A", text: "Energy equal to or exceeding Ea, and correct spatial orientation." },
            { id: "B", text: "High magnetic charge and zero mass." },
            { id: "C", text: "Absolute zero temperature and high light intensity." },
            { id: "D", text: "Equal molecular weights and non-zero dipole moment." }
          ],
          correctOption: "A",
          explanation: "Particles must collide with kinetic energy >= Ea and with proper geometry so the reacting bonds can break and reform.",
          conceptTested: "Collision Theory"
        }
      ]
    }
  ]
};
