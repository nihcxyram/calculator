import { useEffect, useState } from "react";

/* =========================================
   Calculator Button Component
========================================= */

function CalculatorButton({
  children,
  onClick,
  type = "number",
  className = "",
  ariaLabel,
}) {
  const styles = {
    number:
      "bg-slate-800 text-white hover:bg-slate-700 active:scale-95",
    operator:
      "bg-blue-600 text-white hover:bg-blue-500 active:scale-95",
    clear:
      "bg-red-500 text-white hover:bg-red-400 active:scale-95",
    equals:
      "bg-emerald-500 text-white hover:bg-emerald-400 active:scale-95",
    special:
      "bg-slate-700 text-white hover:bg-slate-600 active:scale-95",
  };

  return (
    <button
      type="button"
      aria-label={ariaLabel}
      onClick={onClick}
      className={`
        ${styles[type]}
        ${className}
        flex
        min-h-16
        items-center
        justify-center
        rounded-2xl
        text-xl
        font-semibold
        shadow-md
        transition-all
        duration-150
        select-none
        sm:min-h-[68px]
      `}
    >
      {children}
    </button>
  );
}

/* =========================================
   Display Component
========================================= */

function Display({ expression, display }) {
  return (
    <div
      className="
        mb-5
        overflow-hidden
        rounded-2xl
        border
        border-slate-700
        bg-slate-950
        p-5
        text-right
        shadow-inner
      "
      aria-live="polite"
      aria-label="Calculator display"
    >
      <div className="mb-2 min-h-6 truncate text-sm text-slate-500">
        {expression || "Ready"}
      </div>

      <div
        className={`
          overflow-x-auto
          whitespace-nowrap
          text-4xl
          font-bold
          tracking-wide
          text-white
          sm:text-5xl
          ${display === "Error" ? "text-red-400" : ""}
        `}
      >
        {display}
      </div>
    </div>
  );
}

/* =========================================
   Calculator Component
========================================= */

function Calculator() {
  const [display, setDisplay] = useState("0");
  const [previousValue, setPreviousValue] = useState(null);
  const [operator, setOperator] = useState(null);
  const [waitingForOperand, setWaitingForOperand] = useState(false);
  const [expression, setExpression] = useState("");
  const [hasError, setHasError] = useState(false);

  /* -----------------------------------------
     Clear calculator
  ----------------------------------------- */

  const clearCalculator = () => {
    setDisplay("0");
    setPreviousValue(null);
    setOperator(null);
    setWaitingForOperand(false);
    setExpression("");
    setHasError(false);
  };

  /* -----------------------------------------
     Add number
  ----------------------------------------- */

  const inputNumber = (number) => {
    if (hasError) {
      clearCalculator();
      setDisplay(number);
      return;
    }

    if (waitingForOperand) {
      setDisplay(number);
      setWaitingForOperand(false);
      return;
    }

    setDisplay((current) => {
      if (current === "0") {
        return number;
      }

      if (current.length >= 15) {
        return current;
      }

      return current + number;
    });
  };

  /* -----------------------------------------
     Add decimal point
  ----------------------------------------- */

  const inputDecimal = () => {
    if (hasError) {
      clearCalculator();
      setDisplay("0.");
      return;
    }

    if (waitingForOperand) {
      setDisplay("0.");
      setWaitingForOperand(false);
      return;
    }

    setDisplay((current) => {
      if (!current.includes(".")) {
        return current + ".";
      }

      return current;
    });
  };

  /* -----------------------------------------
     Perform arithmetic operation
  ----------------------------------------- */

  const calculate = (first, second, selectedOperator) => {
    switch (selectedOperator) {
      case "+":
        return first + second;

      case "-":
        return first - second;

      case "×":
        return first * second;

      case "÷":
        if (second === 0) {
          throw new Error("Cannot divide by zero");
        }

        return first / second;

      default:
        return second;
    }
  };

  /* -----------------------------------------
     Format result
  ----------------------------------------- */

  const formatResult = (result) => {
    if (!Number.isFinite(result)) {
      throw new Error("Invalid calculation");
    }

    const rounded = Number.parseFloat(result.toPrecision(12));

    return String(rounded);
  };

  /* -----------------------------------------
     Handle operator
  ----------------------------------------- */

  const handleOperator = (nextOperator) => {
    if (hasError) {
      return;
    }

    const inputValue = Number(display);

    if (Number.isNaN(inputValue)) {
      return;
    }

    if (operator && previousValue !== null && !waitingForOperand) {
      try {
        const result = calculate(
          previousValue,
          inputValue,
          operator
        );

        const formattedResult = formatResult(result);

        setDisplay(formattedResult);
        setPreviousValue(result);
        setExpression(`${formattedResult} ${nextOperator}`);
      } catch (error) {
        setDisplay("Error");
        setExpression(error.message);
        setHasError(true);
        return;
      }
    } else {
      setPreviousValue(inputValue);
      setExpression(`${display} ${nextOperator}`);
    }

    setOperator(nextOperator);
    setWaitingForOperand(true);
  };

  /* -----------------------------------------
     Equals
  ----------------------------------------- */

  const handleEquals = () => {
    if (
      hasError ||
      operator === null ||
      previousValue === null ||
      waitingForOperand
    ) {
      return;
    }

    const inputValue = Number(display);

    try {
      const result = calculate(
        previousValue,
        inputValue,
        operator
      );

      const formattedResult = formatResult(result);

      setExpression(
        `${previousValue} ${operator} ${inputValue} =`
      );

      setDisplay(formattedResult);
      setPreviousValue(null);
      setOperator(null);
      setWaitingForOperand(true);
    } catch (error) {
      setDisplay("Error");
      setExpression(error.message);
      setPreviousValue(null);
      setOperator(null);
      setWaitingForOperand(false);
      setHasError(true);
    }
  };

  /* -----------------------------------------
     Percentage
  ----------------------------------------- */

  const handlePercentage = () => {
    if (hasError) {
      return;
    }

    const value = Number(display);

    if (Number.isNaN(value)) {
      return;
    }

    const result = value / 100;

    setDisplay(formatResult(result));
  };

  /* -----------------------------------------
     Toggle positive/negative
  ----------------------------------------- */

  const toggleSign = () => {
    if (hasError || display === "0") {
      return;
    }

    if (display.startsWith("-")) {
      setDisplay(display.substring(1));
    } else {
      setDisplay(`-${display}`);
    }
  };

  /* -----------------------------------------
     Keyboard support
  ----------------------------------------- */

  useEffect(() => {
    const handleKeyDown = (event) => {
      const { key } = event;

      if (/^[0-9]$/.test(key)) {
        event.preventDefault();
        inputNumber(key);
        return;
      }

      if (key === ".") {
        event.preventDefault();
        inputDecimal();
        return;
      }

      if (key === "+") {
        event.preventDefault();
        handleOperator("+");
        return;
      }

      if (key === "-") {
        event.preventDefault();
        handleOperator("-");
        return;
      }

      if (key === "*") {
        event.preventDefault();
        handleOperator("×");
        return;
      }

      if (key === "/") {
        event.preventDefault();
        handleOperator("÷");
        return;
      }

      if (key === "%") {
        event.preventDefault();
        handlePercentage();
        return;
      }

      if (key === "Enter" || key === "=") {
        event.preventDefault();
        handleEquals();
        return;
      }

      if (key === "Escape" || key.toLowerCase() === "c") {
        event.preventDefault();
        clearCalculator();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  });

  return (
    <div className="w-full max-w-md">
      <div className="rounded-3xl border border-slate-700 bg-slate-900 p-4 shadow-2xl sm:p-6">
        <Display
          expression={expression}
          display={display}
        />

        <div className="grid grid-cols-4 gap-3">
          <CalculatorButton
            type="clear"
            onClick={clearCalculator}
            ariaLabel="Clear calculator"
          >
            AC
          </CalculatorButton>

          <CalculatorButton
            type="special"
            onClick={toggleSign}
            ariaLabel="Toggle positive or negative"
          >
            ±
          </CalculatorButton>

          <CalculatorButton
            type="special"
            onClick={handlePercentage}
            ariaLabel="Percentage"
          >
            %
          </CalculatorButton>

          <CalculatorButton
            type="operator"
            onClick={() => handleOperator("÷")}
            ariaLabel="Divide"
          >
            ÷
          </CalculatorButton>

          <CalculatorButton
            onClick={() => inputNumber("7")}
          >
            7
          </CalculatorButton>

          <CalculatorButton
            onClick={() => inputNumber("8")}
          >
            8
          </CalculatorButton>

          <CalculatorButton
            onClick={() => inputNumber("9")}
          >
            9
          </CalculatorButton>

          <CalculatorButton
            type="operator"
            onClick={() => handleOperator("×")}
            ariaLabel="Multiply"
          >
            ×
          </CalculatorButton>

          <CalculatorButton
            onClick={() => inputNumber("4")}
          >
            4
          </CalculatorButton>

          <CalculatorButton
            onClick={() => inputNumber("5")}
          >
            5
          </CalculatorButton>

          <CalculatorButton
            onClick={() => inputNumber("6")}
          >
            6
          </CalculatorButton>

          <CalculatorButton
            type="operator"
            onClick={() => handleOperator("-")}
            ariaLabel="Subtract"
          >
            −
          </CalculatorButton>

          <CalculatorButton
            onClick={() => inputNumber("1")}
          >
            1
          </CalculatorButton>

          <CalculatorButton
            onClick={() => inputNumber("2")}
          >
            2
          </CalculatorButton>

          <CalculatorButton
            onClick={() => inputNumber("3")}
          >
            3
          </CalculatorButton>

          <CalculatorButton
            type="operator"
            onClick={() => handleOperator("+")}
            ariaLabel="Add"
          >
            +
          </CalculatorButton>

          <CalculatorButton
            className="col-span-2"
            onClick={() => inputNumber("0")}
          >
            0
          </CalculatorButton>

          <CalculatorButton
            onClick={inputDecimal}
            ariaLabel="Decimal point"
          >
            .
          </CalculatorButton>

          <CalculatorButton
            type="equals"
            onClick={handleEquals}
            ariaLabel="Calculate result"
          >
            =
          </CalculatorButton>
        </div>

        <p className="mt-5 text-center text-xs text-slate-500">
          Keyboard supported: 0–9, +, −, *, /, %, Enter, Esc
        </p>
      </div>
    </div>
  );
}

/* =========================================
   Instructions Component
========================================= */

function Instructions() {
  return (
    <section
      id="instructions"
      className="mt-12 w-full max-w-4xl"
    >
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xl sm:p-8">
        <div className="mb-8">
          <p className="mb-2 text-sm font-bold uppercase tracking-widest text-blue-600">
            User Guide
          </p>

          <h2 className="text-3xl font-bold text-slate-900">
            How to Use the Calculator
          </h2>

          <p className="mt-3 text-slate-600">
            Use the buttons to enter numbers and perform
            mathematical calculations quickly and easily.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <div className="rounded-2xl bg-slate-50 p-5">
            <h3 className="mb-3 text-lg font-bold text-slate-900">
              Step-by-step
            </h3>

            <ol className="space-y-3 text-slate-600">
              <li>
                <span className="font-bold text-blue-600">1.</span>{" "}
                Enter the first number.
              </li>

              <li>
                <span className="font-bold text-blue-600">2.</span>{" "}
                Select an arithmetic operator.
              </li>

              <li>
                <span className="font-bold text-blue-600">3.</span>{" "}
                Enter the second number.
              </li>

              <li>
                <span className="font-bold text-blue-600">4.</span>{" "}
                Press the <strong>=</strong> button.
              </li>

              <li>
                <span className="font-bold text-blue-600">5.</span>{" "}
                Press <strong>AC</strong> to start again.
              </li>
            </ol>
          </div>

          <div className="rounded-2xl bg-slate-50 p-5">
            <h3 className="mb-3 text-lg font-bold text-slate-900">
              Supported Operations
            </h3>

            <div className="space-y-3">
              <div className="flex items-center justify-between rounded-xl bg-white p-3 shadow-sm">
                <span className="text-slate-600">
                  Addition
                </span>

                <span className="font-bold text-blue-600">
                  +
                </span>
              </div>

              <div className="flex items-center justify-between rounded-xl bg-white p-3 shadow-sm">
                <span className="text-slate-600">
                  Subtraction
                </span>

                <span className="font-bold text-blue-600">
                  −
                </span>
              </div>

              <div className="flex items-center justify-between rounded-xl bg-white p-3 shadow-sm">
                <span className="text-slate-600">
                  Multiplication
                </span>

                <span className="font-bold text-blue-600">
                  ×
                </span>
              </div>

              <div className="flex items-center justify-between rounded-xl bg-white p-3 shadow-sm">
                <span className="text-slate-600">
                  Division
                </span>

                <span className="font-bold text-blue-600">
                  ÷
                </span>
              </div>

              <div className="flex items-center justify-between rounded-xl bg-white p-3 shadow-sm">
                <span className="text-slate-600">
                  Percentage
                </span>

                <span className="font-bold text-blue-600">
                  %
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 rounded-2xl border border-blue-100 bg-blue-50 p-5">
          <h3 className="mb-2 font-bold text-blue-900">
            Keyboard Shortcuts
          </h3>

          <p className="text-sm leading-6 text-blue-800">
            You can also use your keyboard. Number keys enter
            numbers, <strong>+</strong>, <strong>-</strong>,
            <strong>*</strong>, and <strong>/</strong> perform
            operations, <strong>Enter</strong> calculates the
            result, and <strong>Escape</strong> clears the
            calculator.
          </p>
        </div>

        <div className="mt-6 rounded-2xl border border-amber-100 bg-amber-50 p-5">
          <h3 className="mb-2 font-bold text-amber-900">
            Error Handling
          </h3>

          <p className="text-sm leading-6 text-amber-800">
            The calculator prevents invalid operations such as
            division by zero and displays an error message when
            a calculation cannot be completed.
          </p>
        </div>
      </div>
    </section>
  );
}

/* =========================================
   Header Component
========================================= */

function Header() {
  return (
    <header className="mb-10 text-center">
      <div className="mb-4 inline-flex items-center rounded-full border border-blue-200 bg-blue-50 px-4 py-2 text-sm font-semibold text-blue-700">
        React + Tailwind CSS
      </div>

      <h1 className="text-4xl font-black tracking-tight text-slate-900 sm:text-5xl">
        Smart<span className="text-blue-600">Calc</span>
      </h1>

      <p className="mx-auto mt-4 max-w-xl text-base leading-7 text-slate-600 sm:text-lg">
        A simple, responsive and user-friendly calculator
        built with React components, state management and
        Tailwind CSS.
      </p>
    </header>
  );
}

/* =========================================
   Footer Component
========================================= */

function Footer() {
  return (
    <footer className="mt-12 border-t border-slate-200 pt-8 text-center">
      <p className="text-sm text-slate-500">
        SmartCalc • Built with React and Tailwind CSS
      </p>

      <p className="mt-2 text-xs text-slate-400">
        Responsive calculator project
      </p>
    </footer>
  );
}

/* =========================================
   Main App
========================================= */

function App() {
  return (
    <div className="min-h-screen bg-linear-to-br from-slate-100 via-white to-blue-50 px-4 py-8 sm:px-6 lg:px-8">
      <main className="mx-auto flex max-w-5xl flex-col items-center">
        <Header />

        <section
          id="calculator"
          aria-label="Calculator"
          className="w-full"
        >
          <Calculator />
        </section>

        <Instructions />

        <Footer />
      </main>
    </div>
  );
}

export default App;