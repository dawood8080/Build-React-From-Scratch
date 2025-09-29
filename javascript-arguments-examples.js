// JavaScript Arguments vs Parameters Examples

// 1. Function declares 2 parameters, receives 5 arguments
function example1(a, b) {
  console.log("Parameters a, b:", a, b);           // Only first 2 are captured
  console.log("Total arguments:", arguments.length); // All 5 are received
  console.log("All arguments:", Array.from(arguments));
}
example1(1, 2, 3, 4, 5);

// 2. Function declares 1 parameter, receives 0 arguments
function example2(x) {
  console.log("x =", x);                          // undefined (no argument passed)
  console.log("arguments.length =", arguments.length); // 0
}
example2();

// 3. Function declares 0 parameters, receives 3 arguments
function example3() {
  console.log("No declared parameters!");
  console.log("But received", arguments.length, "arguments");
  console.log("Arguments:", Array.from(arguments));
}
example3("hello", "world", 123);

// 4. React createElement example - why arguments.length matters
function createElement(type, config, children) {
  // Can be called with 3, 4, 5, 6, or more arguments!
  let childCount = arguments.length - 2;
  
  if (childCount === 1) {
    console.log("Single child:", children);
  } else if (childCount > 1) {
    console.log("Multiple children:", Array.from(arguments).slice(2));
  }
}

createElement('div', null, 'Hello');                    // 3 args
createElement('div', null, 'Hello', 'World');           // 4 args
createElement('div', null, 'A', 'B', 'C', 'D');        // 6 args

// 5. Modern way using rest parameters (ES6+)
function modernCreateElement(type, config, ...children) {
  // children is automatically an array of all extra arguments
  console.log("Children array:", children);
}
modernCreateElement('div', null, 'A', 'B', 'C');
