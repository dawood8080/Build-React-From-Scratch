// OLD WAY (2016) - what the Facebook dev used
function createElement(type, config, children) {
  let props = Object.assign({}, config);

  // Build props.children. We'll make it a new array
  // If we have more than one child.
  let childCount = arguments?.length - 2;
  if (childCount === 1) {
    props.children = children;
  } else if (childCount > 1) {
    props.children = Array.prototype.slice.call(arguments, 2);
  }

  return {
    type,
    props,
  }
}

/* MODERN WAY (2024) - what you would write today
// function createElementModern(type, config, ...children) {
//   let props = Object.assign({}, config);

//   // Much simpler! children is already an array
//   if (children.length === 1) {
//     props.children = children[0];  // Single child
//   } else if (children.length > 1) {
//     props.children = children;     // Array of children
//   }
//   // If children.length === 0, props.children stays undefined

//   return {
//     type,
//     props,
//   }
// }

// // Test both approaches
// console.log("OLD:", createElement('div', null, 'A', 'B', 'C'));
// console.log("NEW:", createElementModern('div', null, 'A', 'B', 'C'));
*/


// Bookkeeping bits. We need to store some data
// and ensure that no roots conflicts.
const ROOT_KEY = 'potatoRoot';
const instancesByRootId = {};
let rootId = 1;

function isRoot(node) {
  return !!node.dataset[ROOT_KEY];
}

function render(element, node) {
  assert(Element.isValidElement(element), 'Element is not a valid React element');

  // First check if we've already rendered into
  // this node. If so, this is an update.
  // Otherwise this is an initial render.
  if (isRoot(node)) {
    update(element, node);
  } else {
    mount(element, node);
  }
}

function mount(element, node) {
  // Create the internal instance. This abstracts
  // away the different component types.
  let component = instantiateComponent(element);

  // Store this for later updates & unmounting.
  instancesByRootId[rootId] = component;
 
  // Mounting generates DOM nodes. This is where
  // React determines if we're re-mounting
  // server-rendered content.
  let RenderedNode = Reconciler.mountComponent(component, node);

  // Do some DOM operations, marking this node as 
  // a root, and inserting the new DOM as a child.
  node.dataset[ROOT_KEY] = rootId;
  DOM.empty(node);
  DOM.appendChild(node, RenderedNode);
  rootId++;
};

function update(element, node) {
  // Find the internal instance and update it.
  let id = node.dataset[ROOT_KEY];
  let instance = instancesByRootId[id];

  let prevElement = instance._currentElement;
  if(shouldUpdateComponent(prevElement, element)) {
    // Send the new element to the instance.
    Reconciler.receiveComponent(
      instance,
      element,
    );
  } else {
    // Unmount and then mount the new one.
    unmountComponentAtNode(node);
    mount(element, node);
  }
};

// This determines if we're going to end up
// reusing an internal instance or not. This is
// one of the big shortcuts that React does,
// Stopping us from instantiating and comparing
// full tress. Instead we immediately throw away
// a subtree when updating from one element type
// to another.

function shouldUpdateComponent(prevElement, nextElement) {
  // Simply use element.type.
  // 'div' !== 'span' so we'll throw away the subtree.
  // ColorSwatch !== CounterButton so we'll throw away the subtree.
  // Note: In react we would also look at the key.
  return prevElement.type === nextElement.type;
}

// ---------------------------  Reconciler ---------------------------------

function mountComponent(component) {
  // This will generate the DOM node that will go
  // into the DOM. We defer to the component
  // instance since it will contain the renderer
  // specific implementation of what that means.
  // This allows the Reconciler to be reused
  // across DOM & Native.
  let markup = component.mountComponent();

  // React does more work here to ensure that 
  // refs work. We don't need to.
  return markup;
};

function receiveComponent(component, element) {
  // Shortcut! We won't do anything if the next
  // element is as same as the current one. This
  // is unlikely in normal JSX usage, but it an
  // optimization that can be unlocked with
  // Babel's inline-element transform.
  let prevElement = component._currentElement;
  if(prevElement === element) {
    return;
  };

  // Defer to the instance.
  component.receiveComponent(element);
};

function unmountComponent(component) {
  // Again, React will do more work here for refs.
  // We don't need to.
  component.unmountComponent();
};

function performUpdateIfNecessary(component) {
  component.performUpdateIfNecessary();
};
