
(function() {
'use strict';

function F2(fun)
{
  function wrapper(a) { return function(b) { return fun(a,b); }; }
  wrapper.arity = 2;
  wrapper.func = fun;
  return wrapper;
}

function F3(fun)
{
  function wrapper(a) {
    return function(b) { return function(c) { return fun(a, b, c); }; };
  }
  wrapper.arity = 3;
  wrapper.func = fun;
  return wrapper;
}

function F4(fun)
{
  function wrapper(a) { return function(b) { return function(c) {
    return function(d) { return fun(a, b, c, d); }; }; };
  }
  wrapper.arity = 4;
  wrapper.func = fun;
  return wrapper;
}

function F5(fun)
{
  function wrapper(a) { return function(b) { return function(c) {
    return function(d) { return function(e) { return fun(a, b, c, d, e); }; }; }; };
  }
  wrapper.arity = 5;
  wrapper.func = fun;
  return wrapper;
}

function F6(fun)
{
  function wrapper(a) { return function(b) { return function(c) {
    return function(d) { return function(e) { return function(f) {
    return fun(a, b, c, d, e, f); }; }; }; }; };
  }
  wrapper.arity = 6;
  wrapper.func = fun;
  return wrapper;
}

function F7(fun)
{
  function wrapper(a) { return function(b) { return function(c) {
    return function(d) { return function(e) { return function(f) {
    return function(g) { return fun(a, b, c, d, e, f, g); }; }; }; }; }; };
  }
  wrapper.arity = 7;
  wrapper.func = fun;
  return wrapper;
}

function F8(fun)
{
  function wrapper(a) { return function(b) { return function(c) {
    return function(d) { return function(e) { return function(f) {
    return function(g) { return function(h) {
    return fun(a, b, c, d, e, f, g, h); }; }; }; }; }; }; };
  }
  wrapper.arity = 8;
  wrapper.func = fun;
  return wrapper;
}

function F9(fun)
{
  function wrapper(a) { return function(b) { return function(c) {
    return function(d) { return function(e) { return function(f) {
    return function(g) { return function(h) { return function(i) {
    return fun(a, b, c, d, e, f, g, h, i); }; }; }; }; }; }; }; };
  }
  wrapper.arity = 9;
  wrapper.func = fun;
  return wrapper;
}

function A2(fun, a, b)
{
  return fun.arity === 2
    ? fun.func(a, b)
    : fun(a)(b);
}
function A3(fun, a, b, c)
{
  return fun.arity === 3
    ? fun.func(a, b, c)
    : fun(a)(b)(c);
}
function A4(fun, a, b, c, d)
{
  return fun.arity === 4
    ? fun.func(a, b, c, d)
    : fun(a)(b)(c)(d);
}
function A5(fun, a, b, c, d, e)
{
  return fun.arity === 5
    ? fun.func(a, b, c, d, e)
    : fun(a)(b)(c)(d)(e);
}
function A6(fun, a, b, c, d, e, f)
{
  return fun.arity === 6
    ? fun.func(a, b, c, d, e, f)
    : fun(a)(b)(c)(d)(e)(f);
}
function A7(fun, a, b, c, d, e, f, g)
{
  return fun.arity === 7
    ? fun.func(a, b, c, d, e, f, g)
    : fun(a)(b)(c)(d)(e)(f)(g);
}
function A8(fun, a, b, c, d, e, f, g, h)
{
  return fun.arity === 8
    ? fun.func(a, b, c, d, e, f, g, h)
    : fun(a)(b)(c)(d)(e)(f)(g)(h);
}
function A9(fun, a, b, c, d, e, f, g, h, i)
{
  return fun.arity === 9
    ? fun.func(a, b, c, d, e, f, g, h, i)
    : fun(a)(b)(c)(d)(e)(f)(g)(h)(i);
}

//import Native.List //

var _elm_lang$core$Native_Array = function() {

// A RRB-Tree has two distinct data types.
// Leaf -> "height"  is always 0
//         "table"   is an array of elements
// Node -> "height"  is always greater than 0
//         "table"   is an array of child nodes
//         "lengths" is an array of accumulated lengths of the child nodes

// M is the maximal table size. 32 seems fast. E is the allowed increase
// of search steps when concatting to find an index. Lower values will
// decrease balancing, but will increase search steps.
var M = 32;
var E = 2;

// An empty array.
var empty = {
	ctor: '_Array',
	height: 0,
	table: []
};


function get(i, array)
{
	if (i < 0 || i >= length(array))
	{
		throw new Error(
			'Index ' + i + ' is out of range. Check the length of ' +
			'your array first or use getMaybe or getWithDefault.');
	}
	return unsafeGet(i, array);
}


function unsafeGet(i, array)
{
	for (var x = array.height; x > 0; x--)
	{
		var slot = i >> (x * 5);
		while (array.lengths[slot] <= i)
		{
			slot++;
		}
		if (slot > 0)
		{
			i -= array.lengths[slot - 1];
		}
		array = array.table[slot];
	}
	return array.table[i];
}


// Sets the value at the index i. Only the nodes leading to i will get
// copied and updated.
function set(i, item, array)
{
	if (i < 0 || length(array) <= i)
	{
		return array;
	}
	return unsafeSet(i, item, array);
}


function unsafeSet(i, item, array)
{
	array = nodeCopy(array);

	if (array.height === 0)
	{
		array.table[i] = item;
	}
	else
	{
		var slot = getSlot(i, array);
		if (slot > 0)
		{
			i -= array.lengths[slot - 1];
		}
		array.table[slot] = unsafeSet(i, item, array.table[slot]);
	}
	return array;
}


function initialize(len, f)
{
	if (len <= 0)
	{
		return empty;
	}
	var h = Math.floor( Math.log(len) / Math.log(M) );
	return initialize_(f, h, 0, len);
}

function initialize_(f, h, from, to)
{
	if (h === 0)
	{
		var table = new Array((to - from) % (M + 1));
		for (var i = 0; i < table.length; i++)
		{
		  table[i] = f(from + i);
		}
		return {
			ctor: '_Array',
			height: 0,
			table: table
		};
	}

	var step = Math.pow(M, h);
	var table = new Array(Math.ceil((to - from) / step));
	var lengths = new Array(table.length);
	for (var i = 0; i < table.length; i++)
	{
		table[i] = initialize_(f, h - 1, from + (i * step), Math.min(from + ((i + 1) * step), to));
		lengths[i] = length(table[i]) + (i > 0 ? lengths[i-1] : 0);
	}
	return {
		ctor: '_Array',
		height: h,
		table: table,
		lengths: lengths
	};
}

function fromList(list)
{
	if (list.ctor === '[]')
	{
		return empty;
	}

	// Allocate M sized blocks (table) and write list elements to it.
	var table = new Array(M);
	var nodes = [];
	var i = 0;

	while (list.ctor !== '[]')
	{
		table[i] = list._0;
		list = list._1;
		i++;

		// table is full, so we can push a leaf containing it into the
		// next node.
		if (i === M)
		{
			var leaf = {
				ctor: '_Array',
				height: 0,
				table: table
			};
			fromListPush(leaf, nodes);
			table = new Array(M);
			i = 0;
		}
	}

	// Maybe there is something left on the table.
	if (i > 0)
	{
		var leaf = {
			ctor: '_Array',
			height: 0,
			table: table.splice(0, i)
		};
		fromListPush(leaf, nodes);
	}

	// Go through all of the nodes and eventually push them into higher nodes.
	for (var h = 0; h < nodes.length - 1; h++)
	{
		if (nodes[h].table.length > 0)
		{
			fromListPush(nodes[h], nodes);
		}
	}

	var head = nodes[nodes.length - 1];
	if (head.height > 0 && head.table.length === 1)
	{
		return head.table[0];
	}
	else
	{
		return head;
	}
}

// Push a node into a higher node as a child.
function fromListPush(toPush, nodes)
{
	var h = toPush.height;

	// Maybe the node on this height does not exist.
	if (nodes.length === h)
	{
		var node = {
			ctor: '_Array',
			height: h + 1,
			table: [],
			lengths: []
		};
		nodes.push(node);
	}

	nodes[h].table.push(toPush);
	var len = length(toPush);
	if (nodes[h].lengths.length > 0)
	{
		len += nodes[h].lengths[nodes[h].lengths.length - 1];
	}
	nodes[h].lengths.push(len);

	if (nodes[h].table.length === M)
	{
		fromListPush(nodes[h], nodes);
		nodes[h] = {
			ctor: '_Array',
			height: h + 1,
			table: [],
			lengths: []
		};
	}
}

// Pushes an item via push_ to the bottom right of a tree.
function push(item, a)
{
	var pushed = push_(item, a);
	if (pushed !== null)
	{
		return pushed;
	}

	var newTree = create(item, a.height);
	return siblise(a, newTree);
}

// Recursively tries to push an item to the bottom-right most
// tree possible. If there is no space left for the item,
// null will be returned.
function push_(item, a)
{
	// Handle resursion stop at leaf level.
	if (a.height === 0)
	{
		if (a.table.length < M)
		{
			var newA = {
				ctor: '_Array',
				height: 0,
				table: a.table.slice()
			};
			newA.table.push(item);
			return newA;
		}
		else
		{
		  return null;
		}
	}

	// Recursively push
	var pushed = push_(item, botRight(a));

	// There was space in the bottom right tree, so the slot will
	// be updated.
	if (pushed !== null)
	{
		var newA = nodeCopy(a);
		newA.table[newA.table.length - 1] = pushed;
		newA.lengths[newA.lengths.length - 1]++;
		return newA;
	}

	// When there was no space left, check if there is space left
	// for a new slot with a tree which contains only the item
	// at the bottom.
	if (a.table.length < M)
	{
		var newSlot = create(item, a.height - 1);
		var newA = nodeCopy(a);
		newA.table.push(newSlot);
		newA.lengths.push(newA.lengths[newA.lengths.length - 1] + length(newSlot));
		return newA;
	}
	else
	{
		return null;
	}
}

// Converts an array into a list of elements.
function toList(a)
{
	return toList_(_elm_lang$core$Native_List.Nil, a);
}

function toList_(list, a)
{
	for (var i = a.table.length - 1; i >= 0; i--)
	{
		list =
			a.height === 0
				? _elm_lang$core$Native_List.Cons(a.table[i], list)
				: toList_(list, a.table[i]);
	}
	return list;
}

// Maps a function over the elements of an array.
function map(f, a)
{
	var newA = {
		ctor: '_Array',
		height: a.height,
		table: new Array(a.table.length)
	};
	if (a.height > 0)
	{
		newA.lengths = a.lengths;
	}
	for (var i = 0; i < a.table.length; i++)
	{
		newA.table[i] =
			a.height === 0
				? f(a.table[i])
				: map(f, a.table[i]);
	}
	return newA;
}

// Maps a function over the elements with their index as first argument.
function indexedMap(f, a)
{
	return indexedMap_(f, a, 0);
}

function indexedMap_(f, a, from)
{
	var newA = {
		ctor: '_Array',
		height: a.height,
		table: new Array(a.table.length)
	};
	if (a.height > 0)
	{
		newA.lengths = a.lengths;
	}
	for (var i = 0; i < a.table.length; i++)
	{
		newA.table[i] =
			a.height === 0
				? A2(f, from + i, a.table[i])
				: indexedMap_(f, a.table[i], i == 0 ? from : from + a.lengths[i - 1]);
	}
	return newA;
}

function foldl(f, b, a)
{
	if (a.height === 0)
	{
		for (var i = 0; i < a.table.length; i++)
		{
			b = A2(f, a.table[i], b);
		}
	}
	else
	{
		for (var i = 0; i < a.table.length; i++)
		{
			b = foldl(f, b, a.table[i]);
		}
	}
	return b;
}

function foldr(f, b, a)
{
	if (a.height === 0)
	{
		for (var i = a.table.length; i--; )
		{
			b = A2(f, a.table[i], b);
		}
	}
	else
	{
		for (var i = a.table.length; i--; )
		{
			b = foldr(f, b, a.table[i]);
		}
	}
	return b;
}

// TODO: currently, it slices the right, then the left. This can be
// optimized.
function slice(from, to, a)
{
	if (from < 0)
	{
		from += length(a);
	}
	if (to < 0)
	{
		to += length(a);
	}
	return sliceLeft(from, sliceRight(to, a));
}

function sliceRight(to, a)
{
	if (to === length(a))
	{
		return a;
	}

	// Handle leaf level.
	if (a.height === 0)
	{
		var newA = { ctor:'_Array', height:0 };
		newA.table = a.table.slice(0, to);
		return newA;
	}

	// Slice the right recursively.
	var right = getSlot(to, a);
	var sliced = sliceRight(to - (right > 0 ? a.lengths[right - 1] : 0), a.table[right]);

	// Maybe the a node is not even needed, as sliced contains the whole slice.
	if (right === 0)
	{
		return sliced;
	}

	// Create new node.
	var newA = {
		ctor: '_Array',
		height: a.height,
		table: a.table.slice(0, right),
		lengths: a.lengths.slice(0, right)
	};
	if (sliced.table.length > 0)
	{
		newA.table[right] = sliced;
		newA.lengths[right] = length(sliced) + (right > 0 ? newA.lengths[right - 1] : 0);
	}
	return newA;
}

function sliceLeft(from, a)
{
	if (from === 0)
	{
		return a;
	}

	// Handle leaf level.
	if (a.height === 0)
	{
		var newA = { ctor:'_Array', height:0 };
		newA.table = a.table.slice(from, a.table.length + 1);
		return newA;
	}

	// Slice the left recursively.
	var left = getSlot(from, a);
	var sliced = sliceLeft(from - (left > 0 ? a.lengths[left - 1] : 0), a.table[left]);

	// Maybe the a node is not even needed, as sliced contains the whole slice.
	if (left === a.table.length - 1)
	{
		return sliced;
	}

	// Create new node.
	var newA = {
		ctor: '_Array',
		height: a.height,
		table: a.table.slice(left, a.table.length + 1),
		lengths: new Array(a.table.length - left)
	};
	newA.table[0] = sliced;
	var len = 0;
	for (var i = 0; i < newA.table.length; i++)
	{
		len += length(newA.table[i]);
		newA.lengths[i] = len;
	}

	return newA;
}

// Appends two trees.
function append(a,b)
{
	if (a.table.length === 0)
	{
		return b;
	}
	if (b.table.length === 0)
	{
		return a;
	}

	var c = append_(a, b);

	// Check if both nodes can be crunshed together.
	if (c[0].table.length + c[1].table.length <= M)
	{
		if (c[0].table.length === 0)
		{
			return c[1];
		}
		if (c[1].table.length === 0)
		{
			return c[0];
		}

		// Adjust .table and .lengths
		c[0].table = c[0].table.concat(c[1].table);
		if (c[0].height > 0)
		{
			var len = length(c[0]);
			for (var i = 0; i < c[1].lengths.length; i++)
			{
				c[1].lengths[i] += len;
			}
			c[0].lengths = c[0].lengths.concat(c[1].lengths);
		}

		return c[0];
	}

	if (c[0].height > 0)
	{
		var toRemove = calcToRemove(a, b);
		if (toRemove > E)
		{
			c = shuffle(c[0], c[1], toRemove);
		}
	}

	return siblise(c[0], c[1]);
}

// Returns an array of two nodes; right and left. One node _may_ be empty.
function append_(a, b)
{
	if (a.height === 0 && b.height === 0)
	{
		return [a, b];
	}

	if (a.height !== 1 || b.height !== 1)
	{
		if (a.height === b.height)
		{
			a = nodeCopy(a);
			b = nodeCopy(b);
			var appended = append_(botRight(a), botLeft(b));

			insertRight(a, appended[1]);
			insertLeft(b, appended[0]);
		}
		else if (a.height > b.height)
		{
			a = nodeCopy(a);
			var appended = append_(botRight(a), b);

			insertRight(a, appended[0]);
			b = parentise(appended[1], appended[1].height + 1);
		}
		else
		{
			b = nodeCopy(b);
			var appended = append_(a, botLeft(b));

			var left = appended[0].table.length === 0 ? 0 : 1;
			var right = left === 0 ? 1 : 0;
			insertLeft(b, appended[left]);
			a = parentise(appended[right], appended[right].height + 1);
		}
	}

	// Check if balancing is needed and return based on that.
	if (a.table.length === 0 || b.table.length === 0)
	{
		return [a, b];
	}

	var toRemove = calcToRemove(a, b);
	if (toRemove <= E)
	{
		return [a, b];
	}
	return shuffle(a, b, toRemove);
}

// Helperfunctions for append_. Replaces a child node at the side of the parent.
function insertRight(parent, node)
{
	var index = parent.table.length - 1;
	parent.table[index] = node;
	parent.lengths[index] = length(node);
	parent.lengths[index] += index > 0 ? parent.lengths[index - 1] : 0;
}

function insertLeft(parent, node)
{
	if (node.table.length > 0)
	{
		parent.table[0] = node;
		parent.lengths[0] = length(node);

		var len = length(parent.table[0]);
		for (var i = 1; i < parent.lengths.length; i++)
		{
			len += length(parent.table[i]);
			parent.lengths[i] = len;
		}
	}
	else
	{
		parent.table.shift();
		for (var i = 1; i < parent.lengths.length; i++)
		{
			parent.lengths[i] = parent.lengths[i] - parent.lengths[0];
		}
		parent.lengths.shift();
	}
}

// Returns the extra search steps for E. Refer to the paper.
function calcToRemove(a, b)
{
	var subLengths = 0;
	for (var i = 0; i < a.table.length; i++)
	{
		subLengths += a.table[i].table.length;
	}
	for (var i = 0; i < b.table.length; i++)
	{
		subLengths += b.table[i].table.length;
	}

	var toRemove = a.table.length + b.table.length;
	return toRemove - (Math.floor((subLengths - 1) / M) + 1);
}

// get2, set2 and saveSlot are helpers for accessing elements over two arrays.
function get2(a, b, index)
{
	return index < a.length
		? a[index]
		: b[index - a.length];
}

function set2(a, b, index, value)
{
	if (index < a.length)
	{
		a[index] = value;
	}
	else
	{
		b[index - a.length] = value;
	}
}

function saveSlot(a, b, index, slot)
{
	set2(a.table, b.table, index, slot);

	var l = (index === 0 || index === a.lengths.length)
		? 0
		: get2(a.lengths, a.lengths, index - 1);

	set2(a.lengths, b.lengths, index, l + length(slot));
}

// Creates a node or leaf with a given length at their arrays for perfomance.
// Is only used by shuffle.
function createNode(h, length)
{
	if (length < 0)
	{
		length = 0;
	}
	var a = {
		ctor: '_Array',
		height: h,
		table: new Array(length)
	};
	if (h > 0)
	{
		a.lengths = new Array(length);
	}
	return a;
}

// Returns an array of two balanced nodes.
function shuffle(a, b, toRemove)
{
	var newA = createNode(a.height, Math.min(M, a.table.length + b.table.length - toRemove));
	var newB = createNode(a.height, newA.table.length - (a.table.length + b.table.length - toRemove));

	// Skip the slots with size M. More precise: copy the slot references
	// to the new node
	var read = 0;
	while (get2(a.table, b.table, read).table.length % M === 0)
	{
		set2(newA.table, newB.table, read, get2(a.table, b.table, read));
		set2(newA.lengths, newB.lengths, read, get2(a.lengths, b.lengths, read));
		read++;
	}

	// Pulling items from left to right, caching in a slot before writing
	// it into the new nodes.
	var write = read;
	var slot = new createNode(a.height - 1, 0);
	var from = 0;

	// If the current slot is still containing data, then there will be at
	// least one more write, so we do not break this loop yet.
	while (read - write - (slot.table.length > 0 ? 1 : 0) < toRemove)
	{
		// Find out the max possible items for copying.
		var source = get2(a.table, b.table, read);
		var to = Math.min(M - slot.table.length, source.table.length);

		// Copy and adjust size table.
		slot.table = slot.table.concat(source.table.slice(from, to));
		if (slot.height > 0)
		{
			var len = slot.lengths.length;
			for (var i = len; i < len + to - from; i++)
			{
				slot.lengths[i] = length(slot.table[i]);
				slot.lengths[i] += (i > 0 ? slot.lengths[i - 1] : 0);
			}
		}

		from += to;

		// Only proceed to next slots[i] if the current one was
		// fully copied.
		if (source.table.length <= to)
		{
			read++; from = 0;
		}

		// Only create a new slot if the current one is filled up.
		if (slot.table.length === M)
		{
			saveSlot(newA, newB, write, slot);
			slot = createNode(a.height - 1, 0);
			write++;
		}
	}

	// Cleanup after the loop. Copy the last slot into the new nodes.
	if (slot.table.length > 0)
	{
		saveSlot(newA, newB, write, slot);
		write++;
	}

	// Shift the untouched slots to the left
	while (read < a.table.length + b.table.length )
	{
		saveSlot(newA, newB, write, get2(a.table, b.table, read));
		read++;
		write++;
	}

	return [newA, newB];
}

// Navigation functions
function botRight(a)
{
	return a.table[a.table.length - 1];
}
function botLeft(a)
{
	return a.table[0];
}

// Copies a node for updating. Note that you should not use this if
// only updating only one of "table" or "lengths" for performance reasons.
function nodeCopy(a)
{
	var newA = {
		ctor: '_Array',
		height: a.height,
		table: a.table.slice()
	};
	if (a.height > 0)
	{
		newA.lengths = a.lengths.slice();
	}
	return newA;
}

// Returns how many items are in the tree.
function length(array)
{
	if (array.height === 0)
	{
		return array.table.length;
	}
	else
	{
		return array.lengths[array.lengths.length - 1];
	}
}

// Calculates in which slot of "table" the item probably is, then
// find the exact slot via forward searching in  "lengths". Returns the index.
function getSlot(i, a)
{
	var slot = i >> (5 * a.height);
	while (a.lengths[slot] <= i)
	{
		slot++;
	}
	return slot;
}

// Recursively creates a tree with a given height containing
// only the given item.
function create(item, h)
{
	if (h === 0)
	{
		return {
			ctor: '_Array',
			height: 0,
			table: [item]
		};
	}
	return {
		ctor: '_Array',
		height: h,
		table: [create(item, h - 1)],
		lengths: [1]
	};
}

// Recursively creates a tree that contains the given tree.
function parentise(tree, h)
{
	if (h === tree.height)
	{
		return tree;
	}

	return {
		ctor: '_Array',
		height: h,
		table: [parentise(tree, h - 1)],
		lengths: [length(tree)]
	};
}

// Emphasizes blood brotherhood beneath two trees.
function siblise(a, b)
{
	return {
		ctor: '_Array',
		height: a.height + 1,
		table: [a, b],
		lengths: [length(a), length(a) + length(b)]
	};
}

function toJSArray(a)
{
	var jsArray = new Array(length(a));
	toJSArray_(jsArray, 0, a);
	return jsArray;
}

function toJSArray_(jsArray, i, a)
{
	for (var t = 0; t < a.table.length; t++)
	{
		if (a.height === 0)
		{
			jsArray[i + t] = a.table[t];
		}
		else
		{
			var inc = t === 0 ? 0 : a.lengths[t - 1];
			toJSArray_(jsArray, i + inc, a.table[t]);
		}
	}
}

function fromJSArray(jsArray)
{
	if (jsArray.length === 0)
	{
		return empty;
	}
	var h = Math.floor(Math.log(jsArray.length) / Math.log(M));
	return fromJSArray_(jsArray, h, 0, jsArray.length);
}

function fromJSArray_(jsArray, h, from, to)
{
	if (h === 0)
	{
		return {
			ctor: '_Array',
			height: 0,
			table: jsArray.slice(from, to)
		};
	}

	var step = Math.pow(M, h);
	var table = new Array(Math.ceil((to - from) / step));
	var lengths = new Array(table.length);
	for (var i = 0; i < table.length; i++)
	{
		table[i] = fromJSArray_(jsArray, h - 1, from + (i * step), Math.min(from + ((i + 1) * step), to));
		lengths[i] = length(table[i]) + (i > 0 ? lengths[i - 1] : 0);
	}
	return {
		ctor: '_Array',
		height: h,
		table: table,
		lengths: lengths
	};
}

return {
	empty: empty,
	fromList: fromList,
	toList: toList,
	initialize: F2(initialize),
	append: F2(append),
	push: F2(push),
	slice: F3(slice),
	get: F2(get),
	set: F3(set),
	map: F2(map),
	indexedMap: F2(indexedMap),
	foldl: F3(foldl),
	foldr: F3(foldr),
	length: length,

	toJSArray: toJSArray,
	fromJSArray: fromJSArray
};

}();
//import Native.Utils //

var _elm_lang$core$Native_Basics = function() {

function div(a, b)
{
	return (a / b) | 0;
}
function rem(a, b)
{
	return a % b;
}
function mod(a, b)
{
	if (b === 0)
	{
		throw new Error('Cannot perform mod 0. Division by zero error.');
	}
	var r = a % b;
	var m = a === 0 ? 0 : (b > 0 ? (a >= 0 ? r : r + b) : -mod(-a, -b));

	return m === b ? 0 : m;
}
function logBase(base, n)
{
	return Math.log(n) / Math.log(base);
}
function negate(n)
{
	return -n;
}
function abs(n)
{
	return n < 0 ? -n : n;
}

function min(a, b)
{
	return _elm_lang$core$Native_Utils.cmp(a, b) < 0 ? a : b;
}
function max(a, b)
{
	return _elm_lang$core$Native_Utils.cmp(a, b) > 0 ? a : b;
}
function clamp(lo, hi, n)
{
	return _elm_lang$core$Native_Utils.cmp(n, lo) < 0
		? lo
		: _elm_lang$core$Native_Utils.cmp(n, hi) > 0
			? hi
			: n;
}

var ord = ['LT', 'EQ', 'GT'];

function compare(x, y)
{
	return { ctor: ord[_elm_lang$core$Native_Utils.cmp(x, y) + 1] };
}

function xor(a, b)
{
	return a !== b;
}
function not(b)
{
	return !b;
}
function isInfinite(n)
{
	return n === Infinity || n === -Infinity;
}

function truncate(n)
{
	return n | 0;
}

function degrees(d)
{
	return d * Math.PI / 180;
}
function turns(t)
{
	return 2 * Math.PI * t;
}
function fromPolar(point)
{
	var r = point._0;
	var t = point._1;
	return _elm_lang$core$Native_Utils.Tuple2(r * Math.cos(t), r * Math.sin(t));
}
function toPolar(point)
{
	var x = point._0;
	var y = point._1;
	return _elm_lang$core$Native_Utils.Tuple2(Math.sqrt(x * x + y * y), Math.atan2(y, x));
}

return {
	div: F2(div),
	rem: F2(rem),
	mod: F2(mod),

	pi: Math.PI,
	e: Math.E,
	cos: Math.cos,
	sin: Math.sin,
	tan: Math.tan,
	acos: Math.acos,
	asin: Math.asin,
	atan: Math.atan,
	atan2: F2(Math.atan2),

	degrees: degrees,
	turns: turns,
	fromPolar: fromPolar,
	toPolar: toPolar,

	sqrt: Math.sqrt,
	logBase: F2(logBase),
	negate: negate,
	abs: abs,
	min: F2(min),
	max: F2(max),
	clamp: F3(clamp),
	compare: F2(compare),

	xor: F2(xor),
	not: not,

	truncate: truncate,
	ceiling: Math.ceil,
	floor: Math.floor,
	round: Math.round,
	toFloat: function(x) { return x; },
	isNaN: isNaN,
	isInfinite: isInfinite
};

}();
//import //

var _elm_lang$core$Native_Utils = function() {

// COMPARISONS

function eq(x, y)
{
	var stack = [];
	var isEqual = eqHelp(x, y, 0, stack);
	var pair;
	while (isEqual && (pair = stack.pop()))
	{
		isEqual = eqHelp(pair.x, pair.y, 0, stack);
	}
	return isEqual;
}


function eqHelp(x, y, depth, stack)
{
	if (depth > 100)
	{
		stack.push({ x: x, y: y });
		return true;
	}

	if (x === y)
	{
		return true;
	}

	if (typeof x !== 'object')
	{
		if (typeof x === 'function')
		{
			throw new Error(
				'Trying to use `(==)` on functions. There is no way to know if functions are "the same" in the Elm sense.'
				+ ' Read more about this at http://package.elm-lang.org/packages/elm-lang/core/latest/Basics#=='
				+ ' which describes why it is this way and what the better version will look like.'
			);
		}
		return false;
	}

	if (x === null || y === null)
	{
		return false
	}

	if (x instanceof Date)
	{
		return x.getTime() === y.getTime();
	}

	if (!('ctor' in x))
	{
		for (var key in x)
		{
			if (!eqHelp(x[key], y[key], depth + 1, stack))
			{
				return false;
			}
		}
		return true;
	}

	// convert Dicts and Sets to lists
	if (x.ctor === 'RBNode_elm_builtin' || x.ctor === 'RBEmpty_elm_builtin')
	{
		x = _elm_lang$core$Dict$toList(x);
		y = _elm_lang$core$Dict$toList(y);
	}
	if (x.ctor === 'Set_elm_builtin')
	{
		x = _elm_lang$core$Set$toList(x);
		y = _elm_lang$core$Set$toList(y);
	}

	// check if lists are equal without recursion
	if (x.ctor === '::')
	{
		var a = x;
		var b = y;
		while (a.ctor === '::' && b.ctor === '::')
		{
			if (!eqHelp(a._0, b._0, depth + 1, stack))
			{
				return false;
			}
			a = a._1;
			b = b._1;
		}
		return a.ctor === b.ctor;
	}

	// check if Arrays are equal
	if (x.ctor === '_Array')
	{
		var xs = _elm_lang$core$Native_Array.toJSArray(x);
		var ys = _elm_lang$core$Native_Array.toJSArray(y);
		if (xs.length !== ys.length)
		{
			return false;
		}
		for (var i = 0; i < xs.length; i++)
		{
			if (!eqHelp(xs[i], ys[i], depth + 1, stack))
			{
				return false;
			}
		}
		return true;
	}

	if (!eqHelp(x.ctor, y.ctor, depth + 1, stack))
	{
		return false;
	}

	for (var key in x)
	{
		if (!eqHelp(x[key], y[key], depth + 1, stack))
		{
			return false;
		}
	}
	return true;
}

// Code in Generate/JavaScript.hs, Basics.js, and List.js depends on
// the particular integer values assigned to LT, EQ, and GT.

var LT = -1, EQ = 0, GT = 1;

function cmp(x, y)
{
	if (typeof x !== 'object')
	{
		return x === y ? EQ : x < y ? LT : GT;
	}

	if (x instanceof String)
	{
		var a = x.valueOf();
		var b = y.valueOf();
		return a === b ? EQ : a < b ? LT : GT;
	}

	if (x.ctor === '::' || x.ctor === '[]')
	{
		while (x.ctor === '::' && y.ctor === '::')
		{
			var ord = cmp(x._0, y._0);
			if (ord !== EQ)
			{
				return ord;
			}
			x = x._1;
			y = y._1;
		}
		return x.ctor === y.ctor ? EQ : x.ctor === '[]' ? LT : GT;
	}

	if (x.ctor.slice(0, 6) === '_Tuple')
	{
		var ord;
		var n = x.ctor.slice(6) - 0;
		var err = 'cannot compare tuples with more than 6 elements.';
		if (n === 0) return EQ;
		if (n >= 1) { ord = cmp(x._0, y._0); if (ord !== EQ) return ord;
		if (n >= 2) { ord = cmp(x._1, y._1); if (ord !== EQ) return ord;
		if (n >= 3) { ord = cmp(x._2, y._2); if (ord !== EQ) return ord;
		if (n >= 4) { ord = cmp(x._3, y._3); if (ord !== EQ) return ord;
		if (n >= 5) { ord = cmp(x._4, y._4); if (ord !== EQ) return ord;
		if (n >= 6) { ord = cmp(x._5, y._5); if (ord !== EQ) return ord;
		if (n >= 7) throw new Error('Comparison error: ' + err); } } } } } }
		return EQ;
	}

	throw new Error(
		'Comparison error: comparison is only defined on ints, '
		+ 'floats, times, chars, strings, lists of comparable values, '
		+ 'and tuples of comparable values.'
	);
}


// COMMON VALUES

var Tuple0 = {
	ctor: '_Tuple0'
};

function Tuple2(x, y)
{
	return {
		ctor: '_Tuple2',
		_0: x,
		_1: y
	};
}

function chr(c)
{
	return new String(c);
}


// GUID

var count = 0;
function guid(_)
{
	return count++;
}


// RECORDS

function update(oldRecord, updatedFields)
{
	var newRecord = {};

	for (var key in oldRecord)
	{
		newRecord[key] = oldRecord[key];
	}

	for (var key in updatedFields)
	{
		newRecord[key] = updatedFields[key];
	}

	return newRecord;
}


//// LIST STUFF ////

var Nil = { ctor: '[]' };

function Cons(hd, tl)
{
	return {
		ctor: '::',
		_0: hd,
		_1: tl
	};
}

function append(xs, ys)
{
	// append Strings
	if (typeof xs === 'string')
	{
		return xs + ys;
	}

	// append Lists
	if (xs.ctor === '[]')
	{
		return ys;
	}
	var root = Cons(xs._0, Nil);
	var curr = root;
	xs = xs._1;
	while (xs.ctor !== '[]')
	{
		curr._1 = Cons(xs._0, Nil);
		xs = xs._1;
		curr = curr._1;
	}
	curr._1 = ys;
	return root;
}


// CRASHES

function crash(moduleName, region)
{
	return function(message) {
		throw new Error(
			'Ran into a `Debug.crash` in module `' + moduleName + '` ' + regionToString(region) + '\n'
			+ 'The message provided by the code author is:\n\n    '
			+ message
		);
	};
}

function crashCase(moduleName, region, value)
{
	return function(message) {
		throw new Error(
			'Ran into a `Debug.crash` in module `' + moduleName + '`\n\n'
			+ 'This was caused by the `case` expression ' + regionToString(region) + '.\n'
			+ 'One of the branches ended with a crash and the following value got through:\n\n    ' + toString(value) + '\n\n'
			+ 'The message provided by the code author is:\n\n    '
			+ message
		);
	};
}

function regionToString(region)
{
	if (region.start.line == region.end.line)
	{
		return 'on line ' + region.start.line;
	}
	return 'between lines ' + region.start.line + ' and ' + region.end.line;
}


// TO STRING

function toString(v)
{
	var type = typeof v;
	if (type === 'function')
	{
		return '<function>';
	}

	if (type === 'boolean')
	{
		return v ? 'True' : 'False';
	}

	if (type === 'number')
	{
		return v + '';
	}

	if (v instanceof String)
	{
		return '\'' + addSlashes(v, true) + '\'';
	}

	if (type === 'string')
	{
		return '"' + addSlashes(v, false) + '"';
	}

	if (v === null)
	{
		return 'null';
	}

	if (type === 'object' && 'ctor' in v)
	{
		var ctorStarter = v.ctor.substring(0, 5);

		if (ctorStarter === '_Tupl')
		{
			var output = [];
			for (var k in v)
			{
				if (k === 'ctor') continue;
				output.push(toString(v[k]));
			}
			return '(' + output.join(',') + ')';
		}

		if (ctorStarter === '_Task')
		{
			return '<task>'
		}

		if (v.ctor === '_Array')
		{
			var list = _elm_lang$core$Array$toList(v);
			return 'Array.fromList ' + toString(list);
		}

		if (v.ctor === '<decoder>')
		{
			return '<decoder>';
		}

		if (v.ctor === '_Process')
		{
			return '<process:' + v.id + '>';
		}

		if (v.ctor === '::')
		{
			var output = '[' + toString(v._0);
			v = v._1;
			while (v.ctor === '::')
			{
				output += ',' + toString(v._0);
				v = v._1;
			}
			return output + ']';
		}

		if (v.ctor === '[]')
		{
			return '[]';
		}

		if (v.ctor === 'Set_elm_builtin')
		{
			return 'Set.fromList ' + toString(_elm_lang$core$Set$toList(v));
		}

		if (v.ctor === 'RBNode_elm_builtin' || v.ctor === 'RBEmpty_elm_builtin')
		{
			return 'Dict.fromList ' + toString(_elm_lang$core$Dict$toList(v));
		}

		var output = '';
		for (var i in v)
		{
			if (i === 'ctor') continue;
			var str = toString(v[i]);
			var c0 = str[0];
			var parenless = c0 === '{' || c0 === '(' || c0 === '<' || c0 === '"' || str.indexOf(' ') < 0;
			output += ' ' + (parenless ? str : '(' + str + ')');
		}
		return v.ctor + output;
	}

	if (type === 'object')
	{
		if (v instanceof Date)
		{
			return '<' + v.toString() + '>';
		}

		if (v.elm_web_socket)
		{
			return '<websocket>';
		}

		var output = [];
		for (var k in v)
		{
			output.push(k + ' = ' + toString(v[k]));
		}
		if (output.length === 0)
		{
			return '{}';
		}
		return '{ ' + output.join(', ') + ' }';
	}

	return '<internal structure>';
}

function addSlashes(str, isChar)
{
	var s = str.replace(/\\/g, '\\\\')
			  .replace(/\n/g, '\\n')
			  .replace(/\t/g, '\\t')
			  .replace(/\r/g, '\\r')
			  .replace(/\v/g, '\\v')
			  .replace(/\0/g, '\\0');
	if (isChar)
	{
		return s.replace(/\'/g, '\\\'');
	}
	else
	{
		return s.replace(/\"/g, '\\"');
	}
}


return {
	eq: eq,
	cmp: cmp,
	Tuple0: Tuple0,
	Tuple2: Tuple2,
	chr: chr,
	update: update,
	guid: guid,

	append: F2(append),

	crash: crash,
	crashCase: crashCase,

	toString: toString
};

}();
var _elm_lang$core$Basics$never = function (_p0) {
	never:
	while (true) {
		var _p1 = _p0;
		var _v1 = _p1._0;
		_p0 = _v1;
		continue never;
	}
};
var _elm_lang$core$Basics$uncurry = F2(
	function (f, _p2) {
		var _p3 = _p2;
		return A2(f, _p3._0, _p3._1);
	});
var _elm_lang$core$Basics$curry = F3(
	function (f, a, b) {
		return f(
			{ctor: '_Tuple2', _0: a, _1: b});
	});
var _elm_lang$core$Basics$flip = F3(
	function (f, b, a) {
		return A2(f, a, b);
	});
var _elm_lang$core$Basics$always = F2(
	function (a, _p4) {
		return a;
	});
var _elm_lang$core$Basics$identity = function (x) {
	return x;
};
var _elm_lang$core$Basics_ops = _elm_lang$core$Basics_ops || {};
_elm_lang$core$Basics_ops['<|'] = F2(
	function (f, x) {
		return f(x);
	});
var _elm_lang$core$Basics_ops = _elm_lang$core$Basics_ops || {};
_elm_lang$core$Basics_ops['|>'] = F2(
	function (x, f) {
		return f(x);
	});
var _elm_lang$core$Basics_ops = _elm_lang$core$Basics_ops || {};
_elm_lang$core$Basics_ops['>>'] = F3(
	function (f, g, x) {
		return g(
			f(x));
	});
var _elm_lang$core$Basics_ops = _elm_lang$core$Basics_ops || {};
_elm_lang$core$Basics_ops['<<'] = F3(
	function (g, f, x) {
		return g(
			f(x));
	});
var _elm_lang$core$Basics_ops = _elm_lang$core$Basics_ops || {};
_elm_lang$core$Basics_ops['++'] = _elm_lang$core$Native_Utils.append;
var _elm_lang$core$Basics$toString = _elm_lang$core$Native_Utils.toString;
var _elm_lang$core$Basics$isInfinite = _elm_lang$core$Native_Basics.isInfinite;
var _elm_lang$core$Basics$isNaN = _elm_lang$core$Native_Basics.isNaN;
var _elm_lang$core$Basics$toFloat = _elm_lang$core$Native_Basics.toFloat;
var _elm_lang$core$Basics$ceiling = _elm_lang$core$Native_Basics.ceiling;
var _elm_lang$core$Basics$floor = _elm_lang$core$Native_Basics.floor;
var _elm_lang$core$Basics$truncate = _elm_lang$core$Native_Basics.truncate;
var _elm_lang$core$Basics$round = _elm_lang$core$Native_Basics.round;
var _elm_lang$core$Basics$not = _elm_lang$core$Native_Basics.not;
var _elm_lang$core$Basics$xor = _elm_lang$core$Native_Basics.xor;
var _elm_lang$core$Basics_ops = _elm_lang$core$Basics_ops || {};
_elm_lang$core$Basics_ops['||'] = _elm_lang$core$Native_Basics.or;
var _elm_lang$core$Basics_ops = _elm_lang$core$Basics_ops || {};
_elm_lang$core$Basics_ops['&&'] = _elm_lang$core$Native_Basics.and;
var _elm_lang$core$Basics$max = _elm_lang$core$Native_Basics.max;
var _elm_lang$core$Basics$min = _elm_lang$core$Native_Basics.min;
var _elm_lang$core$Basics$compare = _elm_lang$core$Native_Basics.compare;
var _elm_lang$core$Basics_ops = _elm_lang$core$Basics_ops || {};
_elm_lang$core$Basics_ops['>='] = _elm_lang$core$Native_Basics.ge;
var _elm_lang$core$Basics_ops = _elm_lang$core$Basics_ops || {};
_elm_lang$core$Basics_ops['<='] = _elm_lang$core$Native_Basics.le;
var _elm_lang$core$Basics_ops = _elm_lang$core$Basics_ops || {};
_elm_lang$core$Basics_ops['>'] = _elm_lang$core$Native_Basics.gt;
var _elm_lang$core$Basics_ops = _elm_lang$core$Basics_ops || {};
_elm_lang$core$Basics_ops['<'] = _elm_lang$core$Native_Basics.lt;
var _elm_lang$core$Basics_ops = _elm_lang$core$Basics_ops || {};
_elm_lang$core$Basics_ops['/='] = _elm_lang$core$Native_Basics.neq;
var _elm_lang$core$Basics_ops = _elm_lang$core$Basics_ops || {};
_elm_lang$core$Basics_ops['=='] = _elm_lang$core$Native_Basics.eq;
var _elm_lang$core$Basics$e = _elm_lang$core$Native_Basics.e;
var _elm_lang$core$Basics$pi = _elm_lang$core$Native_Basics.pi;
var _elm_lang$core$Basics$clamp = _elm_lang$core$Native_Basics.clamp;
var _elm_lang$core$Basics$logBase = _elm_lang$core$Native_Basics.logBase;
var _elm_lang$core$Basics$abs = _elm_lang$core$Native_Basics.abs;
var _elm_lang$core$Basics$negate = _elm_lang$core$Native_Basics.negate;
var _elm_lang$core$Basics$sqrt = _elm_lang$core$Native_Basics.sqrt;
var _elm_lang$core$Basics$atan2 = _elm_lang$core$Native_Basics.atan2;
var _elm_lang$core$Basics$atan = _elm_lang$core$Native_Basics.atan;
var _elm_lang$core$Basics$asin = _elm_lang$core$Native_Basics.asin;
var _elm_lang$core$Basics$acos = _elm_lang$core$Native_Basics.acos;
var _elm_lang$core$Basics$tan = _elm_lang$core$Native_Basics.tan;
var _elm_lang$core$Basics$sin = _elm_lang$core$Native_Basics.sin;
var _elm_lang$core$Basics$cos = _elm_lang$core$Native_Basics.cos;
var _elm_lang$core$Basics_ops = _elm_lang$core$Basics_ops || {};
_elm_lang$core$Basics_ops['^'] = _elm_lang$core$Native_Basics.exp;
var _elm_lang$core$Basics_ops = _elm_lang$core$Basics_ops || {};
_elm_lang$core$Basics_ops['%'] = _elm_lang$core$Native_Basics.mod;
var _elm_lang$core$Basics$rem = _elm_lang$core$Native_Basics.rem;
var _elm_lang$core$Basics_ops = _elm_lang$core$Basics_ops || {};
_elm_lang$core$Basics_ops['//'] = _elm_lang$core$Native_Basics.div;
var _elm_lang$core$Basics_ops = _elm_lang$core$Basics_ops || {};
_elm_lang$core$Basics_ops['/'] = _elm_lang$core$Native_Basics.floatDiv;
var _elm_lang$core$Basics_ops = _elm_lang$core$Basics_ops || {};
_elm_lang$core$Basics_ops['*'] = _elm_lang$core$Native_Basics.mul;
var _elm_lang$core$Basics_ops = _elm_lang$core$Basics_ops || {};
_elm_lang$core$Basics_ops['-'] = _elm_lang$core$Native_Basics.sub;
var _elm_lang$core$Basics_ops = _elm_lang$core$Basics_ops || {};
_elm_lang$core$Basics_ops['+'] = _elm_lang$core$Native_Basics.add;
var _elm_lang$core$Basics$toPolar = _elm_lang$core$Native_Basics.toPolar;
var _elm_lang$core$Basics$fromPolar = _elm_lang$core$Native_Basics.fromPolar;
var _elm_lang$core$Basics$turns = _elm_lang$core$Native_Basics.turns;
var _elm_lang$core$Basics$degrees = _elm_lang$core$Native_Basics.degrees;
var _elm_lang$core$Basics$radians = function (t) {
	return t;
};
var _elm_lang$core$Basics$GT = {ctor: 'GT'};
var _elm_lang$core$Basics$EQ = {ctor: 'EQ'};
var _elm_lang$core$Basics$LT = {ctor: 'LT'};
var _elm_lang$core$Basics$JustOneMore = function (a) {
	return {ctor: 'JustOneMore', _0: a};
};

var _elm_lang$core$Maybe$withDefault = F2(
	function ($default, maybe) {
		var _p0 = maybe;
		if (_p0.ctor === 'Just') {
			return _p0._0;
		} else {
			return $default;
		}
	});
var _elm_lang$core$Maybe$Nothing = {ctor: 'Nothing'};
var _elm_lang$core$Maybe$andThen = F2(
	function (callback, maybeValue) {
		var _p1 = maybeValue;
		if (_p1.ctor === 'Just') {
			return callback(_p1._0);
		} else {
			return _elm_lang$core$Maybe$Nothing;
		}
	});
var _elm_lang$core$Maybe$Just = function (a) {
	return {ctor: 'Just', _0: a};
};
var _elm_lang$core$Maybe$map = F2(
	function (f, maybe) {
		var _p2 = maybe;
		if (_p2.ctor === 'Just') {
			return _elm_lang$core$Maybe$Just(
				f(_p2._0));
		} else {
			return _elm_lang$core$Maybe$Nothing;
		}
	});
var _elm_lang$core$Maybe$map2 = F3(
	function (func, ma, mb) {
		var _p3 = {ctor: '_Tuple2', _0: ma, _1: mb};
		if (((_p3.ctor === '_Tuple2') && (_p3._0.ctor === 'Just')) && (_p3._1.ctor === 'Just')) {
			return _elm_lang$core$Maybe$Just(
				A2(func, _p3._0._0, _p3._1._0));
		} else {
			return _elm_lang$core$Maybe$Nothing;
		}
	});
var _elm_lang$core$Maybe$map3 = F4(
	function (func, ma, mb, mc) {
		var _p4 = {ctor: '_Tuple3', _0: ma, _1: mb, _2: mc};
		if ((((_p4.ctor === '_Tuple3') && (_p4._0.ctor === 'Just')) && (_p4._1.ctor === 'Just')) && (_p4._2.ctor === 'Just')) {
			return _elm_lang$core$Maybe$Just(
				A3(func, _p4._0._0, _p4._1._0, _p4._2._0));
		} else {
			return _elm_lang$core$Maybe$Nothing;
		}
	});
var _elm_lang$core$Maybe$map4 = F5(
	function (func, ma, mb, mc, md) {
		var _p5 = {ctor: '_Tuple4', _0: ma, _1: mb, _2: mc, _3: md};
		if (((((_p5.ctor === '_Tuple4') && (_p5._0.ctor === 'Just')) && (_p5._1.ctor === 'Just')) && (_p5._2.ctor === 'Just')) && (_p5._3.ctor === 'Just')) {
			return _elm_lang$core$Maybe$Just(
				A4(func, _p5._0._0, _p5._1._0, _p5._2._0, _p5._3._0));
		} else {
			return _elm_lang$core$Maybe$Nothing;
		}
	});
var _elm_lang$core$Maybe$map5 = F6(
	function (func, ma, mb, mc, md, me) {
		var _p6 = {ctor: '_Tuple5', _0: ma, _1: mb, _2: mc, _3: md, _4: me};
		if ((((((_p6.ctor === '_Tuple5') && (_p6._0.ctor === 'Just')) && (_p6._1.ctor === 'Just')) && (_p6._2.ctor === 'Just')) && (_p6._3.ctor === 'Just')) && (_p6._4.ctor === 'Just')) {
			return _elm_lang$core$Maybe$Just(
				A5(func, _p6._0._0, _p6._1._0, _p6._2._0, _p6._3._0, _p6._4._0));
		} else {
			return _elm_lang$core$Maybe$Nothing;
		}
	});

//import Native.Utils //

var _elm_lang$core$Native_List = function() {

var Nil = { ctor: '[]' };

function Cons(hd, tl)
{
	return { ctor: '::', _0: hd, _1: tl };
}

function fromArray(arr)
{
	var out = Nil;
	for (var i = arr.length; i--; )
	{
		out = Cons(arr[i], out);
	}
	return out;
}

function toArray(xs)
{
	var out = [];
	while (xs.ctor !== '[]')
	{
		out.push(xs._0);
		xs = xs._1;
	}
	return out;
}

function foldr(f, b, xs)
{
	var arr = toArray(xs);
	var acc = b;
	for (var i = arr.length; i--; )
	{
		acc = A2(f, arr[i], acc);
	}
	return acc;
}

function map2(f, xs, ys)
{
	var arr = [];
	while (xs.ctor !== '[]' && ys.ctor !== '[]')
	{
		arr.push(A2(f, xs._0, ys._0));
		xs = xs._1;
		ys = ys._1;
	}
	return fromArray(arr);
}

function map3(f, xs, ys, zs)
{
	var arr = [];
	while (xs.ctor !== '[]' && ys.ctor !== '[]' && zs.ctor !== '[]')
	{
		arr.push(A3(f, xs._0, ys._0, zs._0));
		xs = xs._1;
		ys = ys._1;
		zs = zs._1;
	}
	return fromArray(arr);
}

function map4(f, ws, xs, ys, zs)
{
	var arr = [];
	while (   ws.ctor !== '[]'
		   && xs.ctor !== '[]'
		   && ys.ctor !== '[]'
		   && zs.ctor !== '[]')
	{
		arr.push(A4(f, ws._0, xs._0, ys._0, zs._0));
		ws = ws._1;
		xs = xs._1;
		ys = ys._1;
		zs = zs._1;
	}
	return fromArray(arr);
}

function map5(f, vs, ws, xs, ys, zs)
{
	var arr = [];
	while (   vs.ctor !== '[]'
		   && ws.ctor !== '[]'
		   && xs.ctor !== '[]'
		   && ys.ctor !== '[]'
		   && zs.ctor !== '[]')
	{
		arr.push(A5(f, vs._0, ws._0, xs._0, ys._0, zs._0));
		vs = vs._1;
		ws = ws._1;
		xs = xs._1;
		ys = ys._1;
		zs = zs._1;
	}
	return fromArray(arr);
}

function sortBy(f, xs)
{
	return fromArray(toArray(xs).sort(function(a, b) {
		return _elm_lang$core$Native_Utils.cmp(f(a), f(b));
	}));
}

function sortWith(f, xs)
{
	return fromArray(toArray(xs).sort(function(a, b) {
		var ord = f(a)(b).ctor;
		return ord === 'EQ' ? 0 : ord === 'LT' ? -1 : 1;
	}));
}

return {
	Nil: Nil,
	Cons: Cons,
	cons: F2(Cons),
	toArray: toArray,
	fromArray: fromArray,

	foldr: F3(foldr),

	map2: F3(map2),
	map3: F4(map3),
	map4: F5(map4),
	map5: F6(map5),
	sortBy: F2(sortBy),
	sortWith: F2(sortWith)
};

}();
var _elm_lang$core$List$sortWith = _elm_lang$core$Native_List.sortWith;
var _elm_lang$core$List$sortBy = _elm_lang$core$Native_List.sortBy;
var _elm_lang$core$List$sort = function (xs) {
	return A2(_elm_lang$core$List$sortBy, _elm_lang$core$Basics$identity, xs);
};
var _elm_lang$core$List$singleton = function (value) {
	return {
		ctor: '::',
		_0: value,
		_1: {ctor: '[]'}
	};
};
var _elm_lang$core$List$drop = F2(
	function (n, list) {
		drop:
		while (true) {
			if (_elm_lang$core$Native_Utils.cmp(n, 0) < 1) {
				return list;
			} else {
				var _p0 = list;
				if (_p0.ctor === '[]') {
					return list;
				} else {
					var _v1 = n - 1,
						_v2 = _p0._1;
					n = _v1;
					list = _v2;
					continue drop;
				}
			}
		}
	});
var _elm_lang$core$List$map5 = _elm_lang$core$Native_List.map5;
var _elm_lang$core$List$map4 = _elm_lang$core$Native_List.map4;
var _elm_lang$core$List$map3 = _elm_lang$core$Native_List.map3;
var _elm_lang$core$List$map2 = _elm_lang$core$Native_List.map2;
var _elm_lang$core$List$any = F2(
	function (isOkay, list) {
		any:
		while (true) {
			var _p1 = list;
			if (_p1.ctor === '[]') {
				return false;
			} else {
				if (isOkay(_p1._0)) {
					return true;
				} else {
					var _v4 = isOkay,
						_v5 = _p1._1;
					isOkay = _v4;
					list = _v5;
					continue any;
				}
			}
		}
	});
var _elm_lang$core$List$all = F2(
	function (isOkay, list) {
		return !A2(
			_elm_lang$core$List$any,
			function (_p2) {
				return !isOkay(_p2);
			},
			list);
	});
var _elm_lang$core$List$foldr = _elm_lang$core$Native_List.foldr;
var _elm_lang$core$List$foldl = F3(
	function (func, acc, list) {
		foldl:
		while (true) {
			var _p3 = list;
			if (_p3.ctor === '[]') {
				return acc;
			} else {
				var _v7 = func,
					_v8 = A2(func, _p3._0, acc),
					_v9 = _p3._1;
				func = _v7;
				acc = _v8;
				list = _v9;
				continue foldl;
			}
		}
	});
var _elm_lang$core$List$length = function (xs) {
	return A3(
		_elm_lang$core$List$foldl,
		F2(
			function (_p4, i) {
				return i + 1;
			}),
		0,
		xs);
};
var _elm_lang$core$List$sum = function (numbers) {
	return A3(
		_elm_lang$core$List$foldl,
		F2(
			function (x, y) {
				return x + y;
			}),
		0,
		numbers);
};
var _elm_lang$core$List$product = function (numbers) {
	return A3(
		_elm_lang$core$List$foldl,
		F2(
			function (x, y) {
				return x * y;
			}),
		1,
		numbers);
};
var _elm_lang$core$List$maximum = function (list) {
	var _p5 = list;
	if (_p5.ctor === '::') {
		return _elm_lang$core$Maybe$Just(
			A3(_elm_lang$core$List$foldl, _elm_lang$core$Basics$max, _p5._0, _p5._1));
	} else {
		return _elm_lang$core$Maybe$Nothing;
	}
};
var _elm_lang$core$List$minimum = function (list) {
	var _p6 = list;
	if (_p6.ctor === '::') {
		return _elm_lang$core$Maybe$Just(
			A3(_elm_lang$core$List$foldl, _elm_lang$core$Basics$min, _p6._0, _p6._1));
	} else {
		return _elm_lang$core$Maybe$Nothing;
	}
};
var _elm_lang$core$List$member = F2(
	function (x, xs) {
		return A2(
			_elm_lang$core$List$any,
			function (a) {
				return _elm_lang$core$Native_Utils.eq(a, x);
			},
			xs);
	});
var _elm_lang$core$List$isEmpty = function (xs) {
	var _p7 = xs;
	if (_p7.ctor === '[]') {
		return true;
	} else {
		return false;
	}
};
var _elm_lang$core$List$tail = function (list) {
	var _p8 = list;
	if (_p8.ctor === '::') {
		return _elm_lang$core$Maybe$Just(_p8._1);
	} else {
		return _elm_lang$core$Maybe$Nothing;
	}
};
var _elm_lang$core$List$head = function (list) {
	var _p9 = list;
	if (_p9.ctor === '::') {
		return _elm_lang$core$Maybe$Just(_p9._0);
	} else {
		return _elm_lang$core$Maybe$Nothing;
	}
};
var _elm_lang$core$List_ops = _elm_lang$core$List_ops || {};
_elm_lang$core$List_ops['::'] = _elm_lang$core$Native_List.cons;
var _elm_lang$core$List$map = F2(
	function (f, xs) {
		return A3(
			_elm_lang$core$List$foldr,
			F2(
				function (x, acc) {
					return {
						ctor: '::',
						_0: f(x),
						_1: acc
					};
				}),
			{ctor: '[]'},
			xs);
	});
var _elm_lang$core$List$filter = F2(
	function (pred, xs) {
		var conditionalCons = F2(
			function (front, back) {
				return pred(front) ? {ctor: '::', _0: front, _1: back} : back;
			});
		return A3(
			_elm_lang$core$List$foldr,
			conditionalCons,
			{ctor: '[]'},
			xs);
	});
var _elm_lang$core$List$maybeCons = F3(
	function (f, mx, xs) {
		var _p10 = f(mx);
		if (_p10.ctor === 'Just') {
			return {ctor: '::', _0: _p10._0, _1: xs};
		} else {
			return xs;
		}
	});
var _elm_lang$core$List$filterMap = F2(
	function (f, xs) {
		return A3(
			_elm_lang$core$List$foldr,
			_elm_lang$core$List$maybeCons(f),
			{ctor: '[]'},
			xs);
	});
var _elm_lang$core$List$reverse = function (list) {
	return A3(
		_elm_lang$core$List$foldl,
		F2(
			function (x, y) {
				return {ctor: '::', _0: x, _1: y};
			}),
		{ctor: '[]'},
		list);
};
var _elm_lang$core$List$scanl = F3(
	function (f, b, xs) {
		var scan1 = F2(
			function (x, accAcc) {
				var _p11 = accAcc;
				if (_p11.ctor === '::') {
					return {
						ctor: '::',
						_0: A2(f, x, _p11._0),
						_1: accAcc
					};
				} else {
					return {ctor: '[]'};
				}
			});
		return _elm_lang$core$List$reverse(
			A3(
				_elm_lang$core$List$foldl,
				scan1,
				{
					ctor: '::',
					_0: b,
					_1: {ctor: '[]'}
				},
				xs));
	});
var _elm_lang$core$List$append = F2(
	function (xs, ys) {
		var _p12 = ys;
		if (_p12.ctor === '[]') {
			return xs;
		} else {
			return A3(
				_elm_lang$core$List$foldr,
				F2(
					function (x, y) {
						return {ctor: '::', _0: x, _1: y};
					}),
				ys,
				xs);
		}
	});
var _elm_lang$core$List$concat = function (lists) {
	return A3(
		_elm_lang$core$List$foldr,
		_elm_lang$core$List$append,
		{ctor: '[]'},
		lists);
};
var _elm_lang$core$List$concatMap = F2(
	function (f, list) {
		return _elm_lang$core$List$concat(
			A2(_elm_lang$core$List$map, f, list));
	});
var _elm_lang$core$List$partition = F2(
	function (pred, list) {
		var step = F2(
			function (x, _p13) {
				var _p14 = _p13;
				var _p16 = _p14._0;
				var _p15 = _p14._1;
				return pred(x) ? {
					ctor: '_Tuple2',
					_0: {ctor: '::', _0: x, _1: _p16},
					_1: _p15
				} : {
					ctor: '_Tuple2',
					_0: _p16,
					_1: {ctor: '::', _0: x, _1: _p15}
				};
			});
		return A3(
			_elm_lang$core$List$foldr,
			step,
			{
				ctor: '_Tuple2',
				_0: {ctor: '[]'},
				_1: {ctor: '[]'}
			},
			list);
	});
var _elm_lang$core$List$unzip = function (pairs) {
	var step = F2(
		function (_p18, _p17) {
			var _p19 = _p18;
			var _p20 = _p17;
			return {
				ctor: '_Tuple2',
				_0: {ctor: '::', _0: _p19._0, _1: _p20._0},
				_1: {ctor: '::', _0: _p19._1, _1: _p20._1}
			};
		});
	return A3(
		_elm_lang$core$List$foldr,
		step,
		{
			ctor: '_Tuple2',
			_0: {ctor: '[]'},
			_1: {ctor: '[]'}
		},
		pairs);
};
var _elm_lang$core$List$intersperse = F2(
	function (sep, xs) {
		var _p21 = xs;
		if (_p21.ctor === '[]') {
			return {ctor: '[]'};
		} else {
			var step = F2(
				function (x, rest) {
					return {
						ctor: '::',
						_0: sep,
						_1: {ctor: '::', _0: x, _1: rest}
					};
				});
			var spersed = A3(
				_elm_lang$core$List$foldr,
				step,
				{ctor: '[]'},
				_p21._1);
			return {ctor: '::', _0: _p21._0, _1: spersed};
		}
	});
var _elm_lang$core$List$takeReverse = F3(
	function (n, list, taken) {
		takeReverse:
		while (true) {
			if (_elm_lang$core$Native_Utils.cmp(n, 0) < 1) {
				return taken;
			} else {
				var _p22 = list;
				if (_p22.ctor === '[]') {
					return taken;
				} else {
					var _v23 = n - 1,
						_v24 = _p22._1,
						_v25 = {ctor: '::', _0: _p22._0, _1: taken};
					n = _v23;
					list = _v24;
					taken = _v25;
					continue takeReverse;
				}
			}
		}
	});
var _elm_lang$core$List$takeTailRec = F2(
	function (n, list) {
		return _elm_lang$core$List$reverse(
			A3(
				_elm_lang$core$List$takeReverse,
				n,
				list,
				{ctor: '[]'}));
	});
var _elm_lang$core$List$takeFast = F3(
	function (ctr, n, list) {
		if (_elm_lang$core$Native_Utils.cmp(n, 0) < 1) {
			return {ctor: '[]'};
		} else {
			var _p23 = {ctor: '_Tuple2', _0: n, _1: list};
			_v26_5:
			do {
				_v26_1:
				do {
					if (_p23.ctor === '_Tuple2') {
						if (_p23._1.ctor === '[]') {
							return list;
						} else {
							if (_p23._1._1.ctor === '::') {
								switch (_p23._0) {
									case 1:
										break _v26_1;
									case 2:
										return {
											ctor: '::',
											_0: _p23._1._0,
											_1: {
												ctor: '::',
												_0: _p23._1._1._0,
												_1: {ctor: '[]'}
											}
										};
									case 3:
										if (_p23._1._1._1.ctor === '::') {
											return {
												ctor: '::',
												_0: _p23._1._0,
												_1: {
													ctor: '::',
													_0: _p23._1._1._0,
													_1: {
														ctor: '::',
														_0: _p23._1._1._1._0,
														_1: {ctor: '[]'}
													}
												}
											};
										} else {
											break _v26_5;
										}
									default:
										if ((_p23._1._1._1.ctor === '::') && (_p23._1._1._1._1.ctor === '::')) {
											var _p28 = _p23._1._1._1._0;
											var _p27 = _p23._1._1._0;
											var _p26 = _p23._1._0;
											var _p25 = _p23._1._1._1._1._0;
											var _p24 = _p23._1._1._1._1._1;
											return (_elm_lang$core$Native_Utils.cmp(ctr, 1000) > 0) ? {
												ctor: '::',
												_0: _p26,
												_1: {
													ctor: '::',
													_0: _p27,
													_1: {
														ctor: '::',
														_0: _p28,
														_1: {
															ctor: '::',
															_0: _p25,
															_1: A2(_elm_lang$core$List$takeTailRec, n - 4, _p24)
														}
													}
												}
											} : {
												ctor: '::',
												_0: _p26,
												_1: {
													ctor: '::',
													_0: _p27,
													_1: {
														ctor: '::',
														_0: _p28,
														_1: {
															ctor: '::',
															_0: _p25,
															_1: A3(_elm_lang$core$List$takeFast, ctr + 1, n - 4, _p24)
														}
													}
												}
											};
										} else {
											break _v26_5;
										}
								}
							} else {
								if (_p23._0 === 1) {
									break _v26_1;
								} else {
									break _v26_5;
								}
							}
						}
					} else {
						break _v26_5;
					}
				} while(false);
				return {
					ctor: '::',
					_0: _p23._1._0,
					_1: {ctor: '[]'}
				};
			} while(false);
			return list;
		}
	});
var _elm_lang$core$List$take = F2(
	function (n, list) {
		return A3(_elm_lang$core$List$takeFast, 0, n, list);
	});
var _elm_lang$core$List$repeatHelp = F3(
	function (result, n, value) {
		repeatHelp:
		while (true) {
			if (_elm_lang$core$Native_Utils.cmp(n, 0) < 1) {
				return result;
			} else {
				var _v27 = {ctor: '::', _0: value, _1: result},
					_v28 = n - 1,
					_v29 = value;
				result = _v27;
				n = _v28;
				value = _v29;
				continue repeatHelp;
			}
		}
	});
var _elm_lang$core$List$repeat = F2(
	function (n, value) {
		return A3(
			_elm_lang$core$List$repeatHelp,
			{ctor: '[]'},
			n,
			value);
	});
var _elm_lang$core$List$rangeHelp = F3(
	function (lo, hi, list) {
		rangeHelp:
		while (true) {
			if (_elm_lang$core$Native_Utils.cmp(lo, hi) < 1) {
				var _v30 = lo,
					_v31 = hi - 1,
					_v32 = {ctor: '::', _0: hi, _1: list};
				lo = _v30;
				hi = _v31;
				list = _v32;
				continue rangeHelp;
			} else {
				return list;
			}
		}
	});
var _elm_lang$core$List$range = F2(
	function (lo, hi) {
		return A3(
			_elm_lang$core$List$rangeHelp,
			lo,
			hi,
			{ctor: '[]'});
	});
var _elm_lang$core$List$indexedMap = F2(
	function (f, xs) {
		return A3(
			_elm_lang$core$List$map2,
			f,
			A2(
				_elm_lang$core$List$range,
				0,
				_elm_lang$core$List$length(xs) - 1),
			xs);
	});

var _elm_lang$core$Array$append = _elm_lang$core$Native_Array.append;
var _elm_lang$core$Array$length = _elm_lang$core$Native_Array.length;
var _elm_lang$core$Array$isEmpty = function (array) {
	return _elm_lang$core$Native_Utils.eq(
		_elm_lang$core$Array$length(array),
		0);
};
var _elm_lang$core$Array$slice = _elm_lang$core$Native_Array.slice;
var _elm_lang$core$Array$set = _elm_lang$core$Native_Array.set;
var _elm_lang$core$Array$get = F2(
	function (i, array) {
		return ((_elm_lang$core$Native_Utils.cmp(0, i) < 1) && (_elm_lang$core$Native_Utils.cmp(
			i,
			_elm_lang$core$Native_Array.length(array)) < 0)) ? _elm_lang$core$Maybe$Just(
			A2(_elm_lang$core$Native_Array.get, i, array)) : _elm_lang$core$Maybe$Nothing;
	});
var _elm_lang$core$Array$push = _elm_lang$core$Native_Array.push;
var _elm_lang$core$Array$empty = _elm_lang$core$Native_Array.empty;
var _elm_lang$core$Array$filter = F2(
	function (isOkay, arr) {
		var update = F2(
			function (x, xs) {
				return isOkay(x) ? A2(_elm_lang$core$Native_Array.push, x, xs) : xs;
			});
		return A3(_elm_lang$core$Native_Array.foldl, update, _elm_lang$core$Native_Array.empty, arr);
	});
var _elm_lang$core$Array$foldr = _elm_lang$core$Native_Array.foldr;
var _elm_lang$core$Array$foldl = _elm_lang$core$Native_Array.foldl;
var _elm_lang$core$Array$indexedMap = _elm_lang$core$Native_Array.indexedMap;
var _elm_lang$core$Array$map = _elm_lang$core$Native_Array.map;
var _elm_lang$core$Array$toIndexedList = function (array) {
	return A3(
		_elm_lang$core$List$map2,
		F2(
			function (v0, v1) {
				return {ctor: '_Tuple2', _0: v0, _1: v1};
			}),
		A2(
			_elm_lang$core$List$range,
			0,
			_elm_lang$core$Native_Array.length(array) - 1),
		_elm_lang$core$Native_Array.toList(array));
};
var _elm_lang$core$Array$toList = _elm_lang$core$Native_Array.toList;
var _elm_lang$core$Array$fromList = _elm_lang$core$Native_Array.fromList;
var _elm_lang$core$Array$initialize = _elm_lang$core$Native_Array.initialize;
var _elm_lang$core$Array$repeat = F2(
	function (n, e) {
		return A2(
			_elm_lang$core$Array$initialize,
			n,
			_elm_lang$core$Basics$always(e));
	});
var _elm_lang$core$Array$Array = {ctor: 'Array'};

//import Native.Utils //

var _elm_lang$core$Native_Char = function() {

return {
	fromCode: function(c) { return _elm_lang$core$Native_Utils.chr(String.fromCharCode(c)); },
	toCode: function(c) { return c.charCodeAt(0); },
	toUpper: function(c) { return _elm_lang$core$Native_Utils.chr(c.toUpperCase()); },
	toLower: function(c) { return _elm_lang$core$Native_Utils.chr(c.toLowerCase()); },
	toLocaleUpper: function(c) { return _elm_lang$core$Native_Utils.chr(c.toLocaleUpperCase()); },
	toLocaleLower: function(c) { return _elm_lang$core$Native_Utils.chr(c.toLocaleLowerCase()); }
};

}();
var _elm_lang$core$Char$fromCode = _elm_lang$core$Native_Char.fromCode;
var _elm_lang$core$Char$toCode = _elm_lang$core$Native_Char.toCode;
var _elm_lang$core$Char$toLocaleLower = _elm_lang$core$Native_Char.toLocaleLower;
var _elm_lang$core$Char$toLocaleUpper = _elm_lang$core$Native_Char.toLocaleUpper;
var _elm_lang$core$Char$toLower = _elm_lang$core$Native_Char.toLower;
var _elm_lang$core$Char$toUpper = _elm_lang$core$Native_Char.toUpper;
var _elm_lang$core$Char$isBetween = F3(
	function (low, high, $char) {
		var code = _elm_lang$core$Char$toCode($char);
		return (_elm_lang$core$Native_Utils.cmp(
			code,
			_elm_lang$core$Char$toCode(low)) > -1) && (_elm_lang$core$Native_Utils.cmp(
			code,
			_elm_lang$core$Char$toCode(high)) < 1);
	});
var _elm_lang$core$Char$isUpper = A2(
	_elm_lang$core$Char$isBetween,
	_elm_lang$core$Native_Utils.chr('A'),
	_elm_lang$core$Native_Utils.chr('Z'));
var _elm_lang$core$Char$isLower = A2(
	_elm_lang$core$Char$isBetween,
	_elm_lang$core$Native_Utils.chr('a'),
	_elm_lang$core$Native_Utils.chr('z'));
var _elm_lang$core$Char$isDigit = A2(
	_elm_lang$core$Char$isBetween,
	_elm_lang$core$Native_Utils.chr('0'),
	_elm_lang$core$Native_Utils.chr('9'));
var _elm_lang$core$Char$isOctDigit = A2(
	_elm_lang$core$Char$isBetween,
	_elm_lang$core$Native_Utils.chr('0'),
	_elm_lang$core$Native_Utils.chr('7'));
var _elm_lang$core$Char$isHexDigit = function ($char) {
	return _elm_lang$core$Char$isDigit($char) || (A3(
		_elm_lang$core$Char$isBetween,
		_elm_lang$core$Native_Utils.chr('a'),
		_elm_lang$core$Native_Utils.chr('f'),
		$char) || A3(
		_elm_lang$core$Char$isBetween,
		_elm_lang$core$Native_Utils.chr('A'),
		_elm_lang$core$Native_Utils.chr('F'),
		$char));
};

//import Native.Utils //

var _elm_lang$core$Native_Scheduler = function() {

var MAX_STEPS = 10000;


// TASKS

function succeed(value)
{
	return {
		ctor: '_Task_succeed',
		value: value
	};
}

function fail(error)
{
	return {
		ctor: '_Task_fail',
		value: error
	};
}

function nativeBinding(callback)
{
	return {
		ctor: '_Task_nativeBinding',
		callback: callback,
		cancel: null
	};
}

function andThen(callback, task)
{
	return {
		ctor: '_Task_andThen',
		callback: callback,
		task: task
	};
}

function onError(callback, task)
{
	return {
		ctor: '_Task_onError',
		callback: callback,
		task: task
	};
}

function receive(callback)
{
	return {
		ctor: '_Task_receive',
		callback: callback
	};
}


// PROCESSES

function rawSpawn(task)
{
	var process = {
		ctor: '_Process',
		id: _elm_lang$core$Native_Utils.guid(),
		root: task,
		stack: null,
		mailbox: []
	};

	enqueue(process);

	return process;
}

function spawn(task)
{
	return nativeBinding(function(callback) {
		var process = rawSpawn(task);
		callback(succeed(process));
	});
}

function rawSend(process, msg)
{
	process.mailbox.push(msg);
	enqueue(process);
}

function send(process, msg)
{
	return nativeBinding(function(callback) {
		rawSend(process, msg);
		callback(succeed(_elm_lang$core$Native_Utils.Tuple0));
	});
}

function kill(process)
{
	return nativeBinding(function(callback) {
		var root = process.root;
		if (root.ctor === '_Task_nativeBinding' && root.cancel)
		{
			root.cancel();
		}

		process.root = null;

		callback(succeed(_elm_lang$core$Native_Utils.Tuple0));
	});
}

function sleep(time)
{
	return nativeBinding(function(callback) {
		var id = setTimeout(function() {
			callback(succeed(_elm_lang$core$Native_Utils.Tuple0));
		}, time);

		return function() { clearTimeout(id); };
	});
}


// STEP PROCESSES

function step(numSteps, process)
{
	while (numSteps < MAX_STEPS)
	{
		var ctor = process.root.ctor;

		if (ctor === '_Task_succeed')
		{
			while (process.stack && process.stack.ctor === '_Task_onError')
			{
				process.stack = process.stack.rest;
			}
			if (process.stack === null)
			{
				break;
			}
			process.root = process.stack.callback(process.root.value);
			process.stack = process.stack.rest;
			++numSteps;
			continue;
		}

		if (ctor === '_Task_fail')
		{
			while (process.stack && process.stack.ctor === '_Task_andThen')
			{
				process.stack = process.stack.rest;
			}
			if (process.stack === null)
			{
				break;
			}
			process.root = process.stack.callback(process.root.value);
			process.stack = process.stack.rest;
			++numSteps;
			continue;
		}

		if (ctor === '_Task_andThen')
		{
			process.stack = {
				ctor: '_Task_andThen',
				callback: process.root.callback,
				rest: process.stack
			};
			process.root = process.root.task;
			++numSteps;
			continue;
		}

		if (ctor === '_Task_onError')
		{
			process.stack = {
				ctor: '_Task_onError',
				callback: process.root.callback,
				rest: process.stack
			};
			process.root = process.root.task;
			++numSteps;
			continue;
		}

		if (ctor === '_Task_nativeBinding')
		{
			process.root.cancel = process.root.callback(function(newRoot) {
				process.root = newRoot;
				enqueue(process);
			});

			break;
		}

		if (ctor === '_Task_receive')
		{
			var mailbox = process.mailbox;
			if (mailbox.length === 0)
			{
				break;
			}

			process.root = process.root.callback(mailbox.shift());
			++numSteps;
			continue;
		}

		throw new Error(ctor);
	}

	if (numSteps < MAX_STEPS)
	{
		return numSteps + 1;
	}
	enqueue(process);

	return numSteps;
}


// WORK QUEUE

var working = false;
var workQueue = [];

function enqueue(process)
{
	workQueue.push(process);

	if (!working)
	{
		setTimeout(work, 0);
		working = true;
	}
}

function work()
{
	var numSteps = 0;
	var process;
	while (numSteps < MAX_STEPS && (process = workQueue.shift()))
	{
		if (process.root)
		{
			numSteps = step(numSteps, process);
		}
	}
	if (!process)
	{
		working = false;
		return;
	}
	setTimeout(work, 0);
}


return {
	succeed: succeed,
	fail: fail,
	nativeBinding: nativeBinding,
	andThen: F2(andThen),
	onError: F2(onError),
	receive: receive,

	spawn: spawn,
	kill: kill,
	sleep: sleep,
	send: F2(send),

	rawSpawn: rawSpawn,
	rawSend: rawSend
};

}();
//import //

var _elm_lang$core$Native_Platform = function() {


// PROGRAMS

function program(impl)
{
	return function(flagDecoder)
	{
		return function(object, moduleName)
		{
			object['worker'] = function worker(flags)
			{
				if (typeof flags !== 'undefined')
				{
					throw new Error(
						'The `' + moduleName + '` module does not need flags.\n'
						+ 'Call ' + moduleName + '.worker() with no arguments and you should be all set!'
					);
				}

				return initialize(
					impl.init,
					impl.update,
					impl.subscriptions,
					renderer
				);
			};
		};
	};
}

function programWithFlags(impl)
{
	return function(flagDecoder)
	{
		return function(object, moduleName)
		{
			object['worker'] = function worker(flags)
			{
				if (typeof flagDecoder === 'undefined')
				{
					throw new Error(
						'Are you trying to sneak a Never value into Elm? Trickster!\n'
						+ 'It looks like ' + moduleName + '.main is defined with `programWithFlags` but has type `Program Never`.\n'
						+ 'Use `program` instead if you do not want flags.'
					);
				}

				var result = A2(_elm_lang$core$Native_Json.run, flagDecoder, flags);
				if (result.ctor === 'Err')
				{
					throw new Error(
						moduleName + '.worker(...) was called with an unexpected argument.\n'
						+ 'I tried to convert it to an Elm value, but ran into this problem:\n\n'
						+ result._0
					);
				}

				return initialize(
					impl.init(result._0),
					impl.update,
					impl.subscriptions,
					renderer
				);
			};
		};
	};
}

function renderer(enqueue, _)
{
	return function(_) {};
}


// HTML TO PROGRAM

function htmlToProgram(vnode)
{
	var emptyBag = batch(_elm_lang$core$Native_List.Nil);
	var noChange = _elm_lang$core$Native_Utils.Tuple2(
		_elm_lang$core$Native_Utils.Tuple0,
		emptyBag
	);

	return _elm_lang$virtual_dom$VirtualDom$program({
		init: noChange,
		view: function(model) { return main; },
		update: F2(function(msg, model) { return noChange; }),
		subscriptions: function (model) { return emptyBag; }
	});
}


// INITIALIZE A PROGRAM

function initialize(init, update, subscriptions, renderer)
{
	// ambient state
	var managers = {};
	var updateView;

	// init and update state in main process
	var initApp = _elm_lang$core$Native_Scheduler.nativeBinding(function(callback) {
		var model = init._0;
		updateView = renderer(enqueue, model);
		var cmds = init._1;
		var subs = subscriptions(model);
		dispatchEffects(managers, cmds, subs);
		callback(_elm_lang$core$Native_Scheduler.succeed(model));
	});

	function onMessage(msg, model)
	{
		return _elm_lang$core$Native_Scheduler.nativeBinding(function(callback) {
			var results = A2(update, msg, model);
			model = results._0;
			updateView(model);
			var cmds = results._1;
			var subs = subscriptions(model);
			dispatchEffects(managers, cmds, subs);
			callback(_elm_lang$core$Native_Scheduler.succeed(model));
		});
	}

	var mainProcess = spawnLoop(initApp, onMessage);

	function enqueue(msg)
	{
		_elm_lang$core$Native_Scheduler.rawSend(mainProcess, msg);
	}

	var ports = setupEffects(managers, enqueue);

	return ports ? { ports: ports } : {};
}


// EFFECT MANAGERS

var effectManagers = {};

function setupEffects(managers, callback)
{
	var ports;

	// setup all necessary effect managers
	for (var key in effectManagers)
	{
		var manager = effectManagers[key];

		if (manager.isForeign)
		{
			ports = ports || {};
			ports[key] = manager.tag === 'cmd'
				? setupOutgoingPort(key)
				: setupIncomingPort(key, callback);
		}

		managers[key] = makeManager(manager, callback);
	}

	return ports;
}

function makeManager(info, callback)
{
	var router = {
		main: callback,
		self: undefined
	};

	var tag = info.tag;
	var onEffects = info.onEffects;
	var onSelfMsg = info.onSelfMsg;

	function onMessage(msg, state)
	{
		if (msg.ctor === 'self')
		{
			return A3(onSelfMsg, router, msg._0, state);
		}

		var fx = msg._0;
		switch (tag)
		{
			case 'cmd':
				return A3(onEffects, router, fx.cmds, state);

			case 'sub':
				return A3(onEffects, router, fx.subs, state);

			case 'fx':
				return A4(onEffects, router, fx.cmds, fx.subs, state);
		}
	}

	var process = spawnLoop(info.init, onMessage);
	router.self = process;
	return process;
}

function sendToApp(router, msg)
{
	return _elm_lang$core$Native_Scheduler.nativeBinding(function(callback)
	{
		router.main(msg);
		callback(_elm_lang$core$Native_Scheduler.succeed(_elm_lang$core$Native_Utils.Tuple0));
	});
}

function sendToSelf(router, msg)
{
	return A2(_elm_lang$core$Native_Scheduler.send, router.self, {
		ctor: 'self',
		_0: msg
	});
}


// HELPER for STATEFUL LOOPS

function spawnLoop(init, onMessage)
{
	var andThen = _elm_lang$core$Native_Scheduler.andThen;

	function loop(state)
	{
		var handleMsg = _elm_lang$core$Native_Scheduler.receive(function(msg) {
			return onMessage(msg, state);
		});
		return A2(andThen, loop, handleMsg);
	}

	var task = A2(andThen, loop, init);

	return _elm_lang$core$Native_Scheduler.rawSpawn(task);
}


// BAGS

function leaf(home)
{
	return function(value)
	{
		return {
			type: 'leaf',
			home: home,
			value: value
		};
	};
}

function batch(list)
{
	return {
		type: 'node',
		branches: list
	};
}

function map(tagger, bag)
{
	return {
		type: 'map',
		tagger: tagger,
		tree: bag
	}
}


// PIPE BAGS INTO EFFECT MANAGERS

function dispatchEffects(managers, cmdBag, subBag)
{
	var effectsDict = {};
	gatherEffects(true, cmdBag, effectsDict, null);
	gatherEffects(false, subBag, effectsDict, null);

	for (var home in managers)
	{
		var fx = home in effectsDict
			? effectsDict[home]
			: {
				cmds: _elm_lang$core$Native_List.Nil,
				subs: _elm_lang$core$Native_List.Nil
			};

		_elm_lang$core$Native_Scheduler.rawSend(managers[home], { ctor: 'fx', _0: fx });
	}
}

function gatherEffects(isCmd, bag, effectsDict, taggers)
{
	switch (bag.type)
	{
		case 'leaf':
			var home = bag.home;
			var effect = toEffect(isCmd, home, taggers, bag.value);
			effectsDict[home] = insert(isCmd, effect, effectsDict[home]);
			return;

		case 'node':
			var list = bag.branches;
			while (list.ctor !== '[]')
			{
				gatherEffects(isCmd, list._0, effectsDict, taggers);
				list = list._1;
			}
			return;

		case 'map':
			gatherEffects(isCmd, bag.tree, effectsDict, {
				tagger: bag.tagger,
				rest: taggers
			});
			return;
	}
}

function toEffect(isCmd, home, taggers, value)
{
	function applyTaggers(x)
	{
		var temp = taggers;
		while (temp)
		{
			x = temp.tagger(x);
			temp = temp.rest;
		}
		return x;
	}

	var map = isCmd
		? effectManagers[home].cmdMap
		: effectManagers[home].subMap;

	return A2(map, applyTaggers, value)
}

function insert(isCmd, newEffect, effects)
{
	effects = effects || {
		cmds: _elm_lang$core$Native_List.Nil,
		subs: _elm_lang$core$Native_List.Nil
	};
	if (isCmd)
	{
		effects.cmds = _elm_lang$core$Native_List.Cons(newEffect, effects.cmds);
		return effects;
	}
	effects.subs = _elm_lang$core$Native_List.Cons(newEffect, effects.subs);
	return effects;
}


// PORTS

function checkPortName(name)
{
	if (name in effectManagers)
	{
		throw new Error('There can only be one port named `' + name + '`, but your program has multiple.');
	}
}


// OUTGOING PORTS

function outgoingPort(name, converter)
{
	checkPortName(name);
	effectManagers[name] = {
		tag: 'cmd',
		cmdMap: outgoingPortMap,
		converter: converter,
		isForeign: true
	};
	return leaf(name);
}

var outgoingPortMap = F2(function cmdMap(tagger, value) {
	return value;
});

function setupOutgoingPort(name)
{
	var subs = [];
	var converter = effectManagers[name].converter;

	// CREATE MANAGER

	var init = _elm_lang$core$Native_Scheduler.succeed(null);

	function onEffects(router, cmdList, state)
	{
		while (cmdList.ctor !== '[]')
		{
			// grab a separate reference to subs in case unsubscribe is called
			var currentSubs = subs;
			var value = converter(cmdList._0);
			for (var i = 0; i < currentSubs.length; i++)
			{
				currentSubs[i](value);
			}
			cmdList = cmdList._1;
		}
		return init;
	}

	effectManagers[name].init = init;
	effectManagers[name].onEffects = F3(onEffects);

	// PUBLIC API

	function subscribe(callback)
	{
		subs.push(callback);
	}

	function unsubscribe(callback)
	{
		// copy subs into a new array in case unsubscribe is called within a
		// subscribed callback
		subs = subs.slice();
		var index = subs.indexOf(callback);
		if (index >= 0)
		{
			subs.splice(index, 1);
		}
	}

	return {
		subscribe: subscribe,
		unsubscribe: unsubscribe
	};
}


// INCOMING PORTS

function incomingPort(name, converter)
{
	checkPortName(name);
	effectManagers[name] = {
		tag: 'sub',
		subMap: incomingPortMap,
		converter: converter,
		isForeign: true
	};
	return leaf(name);
}

var incomingPortMap = F2(function subMap(tagger, finalTagger)
{
	return function(value)
	{
		return tagger(finalTagger(value));
	};
});

function setupIncomingPort(name, callback)
{
	var sentBeforeInit = [];
	var subs = _elm_lang$core$Native_List.Nil;
	var converter = effectManagers[name].converter;
	var currentOnEffects = preInitOnEffects;
	var currentSend = preInitSend;

	// CREATE MANAGER

	var init = _elm_lang$core$Native_Scheduler.succeed(null);

	function preInitOnEffects(router, subList, state)
	{
		var postInitResult = postInitOnEffects(router, subList, state);

		for(var i = 0; i < sentBeforeInit.length; i++)
		{
			postInitSend(sentBeforeInit[i]);
		}

		sentBeforeInit = null; // to release objects held in queue
		currentSend = postInitSend;
		currentOnEffects = postInitOnEffects;
		return postInitResult;
	}

	function postInitOnEffects(router, subList, state)
	{
		subs = subList;
		return init;
	}

	function onEffects(router, subList, state)
	{
		return currentOnEffects(router, subList, state);
	}

	effectManagers[name].init = init;
	effectManagers[name].onEffects = F3(onEffects);

	// PUBLIC API

	function preInitSend(value)
	{
		sentBeforeInit.push(value);
	}

	function postInitSend(value)
	{
		var temp = subs;
		while (temp.ctor !== '[]')
		{
			callback(temp._0(value));
			temp = temp._1;
		}
	}

	function send(incomingValue)
	{
		var result = A2(_elm_lang$core$Json_Decode$decodeValue, converter, incomingValue);
		if (result.ctor === 'Err')
		{
			throw new Error('Trying to send an unexpected type of value through port `' + name + '`:\n' + result._0);
		}

		currentSend(result._0);
	}

	return { send: send };
}

return {
	// routers
	sendToApp: F2(sendToApp),
	sendToSelf: F2(sendToSelf),

	// global setup
	effectManagers: effectManagers,
	outgoingPort: outgoingPort,
	incomingPort: incomingPort,

	htmlToProgram: htmlToProgram,
	program: program,
	programWithFlags: programWithFlags,
	initialize: initialize,

	// effect bags
	leaf: leaf,
	batch: batch,
	map: F2(map)
};

}();

var _elm_lang$core$Platform_Cmd$batch = _elm_lang$core$Native_Platform.batch;
var _elm_lang$core$Platform_Cmd$none = _elm_lang$core$Platform_Cmd$batch(
	{ctor: '[]'});
var _elm_lang$core$Platform_Cmd_ops = _elm_lang$core$Platform_Cmd_ops || {};
_elm_lang$core$Platform_Cmd_ops['!'] = F2(
	function (model, commands) {
		return {
			ctor: '_Tuple2',
			_0: model,
			_1: _elm_lang$core$Platform_Cmd$batch(commands)
		};
	});
var _elm_lang$core$Platform_Cmd$map = _elm_lang$core$Native_Platform.map;
var _elm_lang$core$Platform_Cmd$Cmd = {ctor: 'Cmd'};

var _elm_lang$core$Platform_Sub$batch = _elm_lang$core$Native_Platform.batch;
var _elm_lang$core$Platform_Sub$none = _elm_lang$core$Platform_Sub$batch(
	{ctor: '[]'});
var _elm_lang$core$Platform_Sub$map = _elm_lang$core$Native_Platform.map;
var _elm_lang$core$Platform_Sub$Sub = {ctor: 'Sub'};

var _elm_lang$core$Platform$hack = _elm_lang$core$Native_Scheduler.succeed;
var _elm_lang$core$Platform$sendToSelf = _elm_lang$core$Native_Platform.sendToSelf;
var _elm_lang$core$Platform$sendToApp = _elm_lang$core$Native_Platform.sendToApp;
var _elm_lang$core$Platform$programWithFlags = _elm_lang$core$Native_Platform.programWithFlags;
var _elm_lang$core$Platform$program = _elm_lang$core$Native_Platform.program;
var _elm_lang$core$Platform$Program = {ctor: 'Program'};
var _elm_lang$core$Platform$Task = {ctor: 'Task'};
var _elm_lang$core$Platform$ProcessId = {ctor: 'ProcessId'};
var _elm_lang$core$Platform$Router = {ctor: 'Router'};

var _elm_lang$core$Result$toMaybe = function (result) {
	var _p0 = result;
	if (_p0.ctor === 'Ok') {
		return _elm_lang$core$Maybe$Just(_p0._0);
	} else {
		return _elm_lang$core$Maybe$Nothing;
	}
};
var _elm_lang$core$Result$withDefault = F2(
	function (def, result) {
		var _p1 = result;
		if (_p1.ctor === 'Ok') {
			return _p1._0;
		} else {
			return def;
		}
	});
var _elm_lang$core$Result$Err = function (a) {
	return {ctor: 'Err', _0: a};
};
var _elm_lang$core$Result$andThen = F2(
	function (callback, result) {
		var _p2 = result;
		if (_p2.ctor === 'Ok') {
			return callback(_p2._0);
		} else {
			return _elm_lang$core$Result$Err(_p2._0);
		}
	});
var _elm_lang$core$Result$Ok = function (a) {
	return {ctor: 'Ok', _0: a};
};
var _elm_lang$core$Result$map = F2(
	function (func, ra) {
		var _p3 = ra;
		if (_p3.ctor === 'Ok') {
			return _elm_lang$core$Result$Ok(
				func(_p3._0));
		} else {
			return _elm_lang$core$Result$Err(_p3._0);
		}
	});
var _elm_lang$core$Result$map2 = F3(
	function (func, ra, rb) {
		var _p4 = {ctor: '_Tuple2', _0: ra, _1: rb};
		if (_p4._0.ctor === 'Ok') {
			if (_p4._1.ctor === 'Ok') {
				return _elm_lang$core$Result$Ok(
					A2(func, _p4._0._0, _p4._1._0));
			} else {
				return _elm_lang$core$Result$Err(_p4._1._0);
			}
		} else {
			return _elm_lang$core$Result$Err(_p4._0._0);
		}
	});
var _elm_lang$core$Result$map3 = F4(
	function (func, ra, rb, rc) {
		var _p5 = {ctor: '_Tuple3', _0: ra, _1: rb, _2: rc};
		if (_p5._0.ctor === 'Ok') {
			if (_p5._1.ctor === 'Ok') {
				if (_p5._2.ctor === 'Ok') {
					return _elm_lang$core$Result$Ok(
						A3(func, _p5._0._0, _p5._1._0, _p5._2._0));
				} else {
					return _elm_lang$core$Result$Err(_p5._2._0);
				}
			} else {
				return _elm_lang$core$Result$Err(_p5._1._0);
			}
		} else {
			return _elm_lang$core$Result$Err(_p5._0._0);
		}
	});
var _elm_lang$core$Result$map4 = F5(
	function (func, ra, rb, rc, rd) {
		var _p6 = {ctor: '_Tuple4', _0: ra, _1: rb, _2: rc, _3: rd};
		if (_p6._0.ctor === 'Ok') {
			if (_p6._1.ctor === 'Ok') {
				if (_p6._2.ctor === 'Ok') {
					if (_p6._3.ctor === 'Ok') {
						return _elm_lang$core$Result$Ok(
							A4(func, _p6._0._0, _p6._1._0, _p6._2._0, _p6._3._0));
					} else {
						return _elm_lang$core$Result$Err(_p6._3._0);
					}
				} else {
					return _elm_lang$core$Result$Err(_p6._2._0);
				}
			} else {
				return _elm_lang$core$Result$Err(_p6._1._0);
			}
		} else {
			return _elm_lang$core$Result$Err(_p6._0._0);
		}
	});
var _elm_lang$core$Result$map5 = F6(
	function (func, ra, rb, rc, rd, re) {
		var _p7 = {ctor: '_Tuple5', _0: ra, _1: rb, _2: rc, _3: rd, _4: re};
		if (_p7._0.ctor === 'Ok') {
			if (_p7._1.ctor === 'Ok') {
				if (_p7._2.ctor === 'Ok') {
					if (_p7._3.ctor === 'Ok') {
						if (_p7._4.ctor === 'Ok') {
							return _elm_lang$core$Result$Ok(
								A5(func, _p7._0._0, _p7._1._0, _p7._2._0, _p7._3._0, _p7._4._0));
						} else {
							return _elm_lang$core$Result$Err(_p7._4._0);
						}
					} else {
						return _elm_lang$core$Result$Err(_p7._3._0);
					}
				} else {
					return _elm_lang$core$Result$Err(_p7._2._0);
				}
			} else {
				return _elm_lang$core$Result$Err(_p7._1._0);
			}
		} else {
			return _elm_lang$core$Result$Err(_p7._0._0);
		}
	});
var _elm_lang$core$Result$mapError = F2(
	function (f, result) {
		var _p8 = result;
		if (_p8.ctor === 'Ok') {
			return _elm_lang$core$Result$Ok(_p8._0);
		} else {
			return _elm_lang$core$Result$Err(
				f(_p8._0));
		}
	});
var _elm_lang$core$Result$fromMaybe = F2(
	function (err, maybe) {
		var _p9 = maybe;
		if (_p9.ctor === 'Just') {
			return _elm_lang$core$Result$Ok(_p9._0);
		} else {
			return _elm_lang$core$Result$Err(err);
		}
	});

var _elm_lang$core$Task$onError = _elm_lang$core$Native_Scheduler.onError;
var _elm_lang$core$Task$andThen = _elm_lang$core$Native_Scheduler.andThen;
var _elm_lang$core$Task$spawnCmd = F2(
	function (router, _p0) {
		var _p1 = _p0;
		return _elm_lang$core$Native_Scheduler.spawn(
			A2(
				_elm_lang$core$Task$andThen,
				_elm_lang$core$Platform$sendToApp(router),
				_p1._0));
	});
var _elm_lang$core$Task$fail = _elm_lang$core$Native_Scheduler.fail;
var _elm_lang$core$Task$mapError = F2(
	function (convert, task) {
		return A2(
			_elm_lang$core$Task$onError,
			function (_p2) {
				return _elm_lang$core$Task$fail(
					convert(_p2));
			},
			task);
	});
var _elm_lang$core$Task$succeed = _elm_lang$core$Native_Scheduler.succeed;
var _elm_lang$core$Task$map = F2(
	function (func, taskA) {
		return A2(
			_elm_lang$core$Task$andThen,
			function (a) {
				return _elm_lang$core$Task$succeed(
					func(a));
			},
			taskA);
	});
var _elm_lang$core$Task$map2 = F3(
	function (func, taskA, taskB) {
		return A2(
			_elm_lang$core$Task$andThen,
			function (a) {
				return A2(
					_elm_lang$core$Task$andThen,
					function (b) {
						return _elm_lang$core$Task$succeed(
							A2(func, a, b));
					},
					taskB);
			},
			taskA);
	});
var _elm_lang$core$Task$map3 = F4(
	function (func, taskA, taskB, taskC) {
		return A2(
			_elm_lang$core$Task$andThen,
			function (a) {
				return A2(
					_elm_lang$core$Task$andThen,
					function (b) {
						return A2(
							_elm_lang$core$Task$andThen,
							function (c) {
								return _elm_lang$core$Task$succeed(
									A3(func, a, b, c));
							},
							taskC);
					},
					taskB);
			},
			taskA);
	});
var _elm_lang$core$Task$map4 = F5(
	function (func, taskA, taskB, taskC, taskD) {
		return A2(
			_elm_lang$core$Task$andThen,
			function (a) {
				return A2(
					_elm_lang$core$Task$andThen,
					function (b) {
						return A2(
							_elm_lang$core$Task$andThen,
							function (c) {
								return A2(
									_elm_lang$core$Task$andThen,
									function (d) {
										return _elm_lang$core$Task$succeed(
											A4(func, a, b, c, d));
									},
									taskD);
							},
							taskC);
					},
					taskB);
			},
			taskA);
	});
var _elm_lang$core$Task$map5 = F6(
	function (func, taskA, taskB, taskC, taskD, taskE) {
		return A2(
			_elm_lang$core$Task$andThen,
			function (a) {
				return A2(
					_elm_lang$core$Task$andThen,
					function (b) {
						return A2(
							_elm_lang$core$Task$andThen,
							function (c) {
								return A2(
									_elm_lang$core$Task$andThen,
									function (d) {
										return A2(
											_elm_lang$core$Task$andThen,
											function (e) {
												return _elm_lang$core$Task$succeed(
													A5(func, a, b, c, d, e));
											},
											taskE);
									},
									taskD);
							},
							taskC);
					},
					taskB);
			},
			taskA);
	});
var _elm_lang$core$Task$sequence = function (tasks) {
	var _p3 = tasks;
	if (_p3.ctor === '[]') {
		return _elm_lang$core$Task$succeed(
			{ctor: '[]'});
	} else {
		return A3(
			_elm_lang$core$Task$map2,
			F2(
				function (x, y) {
					return {ctor: '::', _0: x, _1: y};
				}),
			_p3._0,
			_elm_lang$core$Task$sequence(_p3._1));
	}
};
var _elm_lang$core$Task$onEffects = F3(
	function (router, commands, state) {
		return A2(
			_elm_lang$core$Task$map,
			function (_p4) {
				return {ctor: '_Tuple0'};
			},
			_elm_lang$core$Task$sequence(
				A2(
					_elm_lang$core$List$map,
					_elm_lang$core$Task$spawnCmd(router),
					commands)));
	});
var _elm_lang$core$Task$init = _elm_lang$core$Task$succeed(
	{ctor: '_Tuple0'});
var _elm_lang$core$Task$onSelfMsg = F3(
	function (_p7, _p6, _p5) {
		return _elm_lang$core$Task$succeed(
			{ctor: '_Tuple0'});
	});
var _elm_lang$core$Task$command = _elm_lang$core$Native_Platform.leaf('Task');
var _elm_lang$core$Task$Perform = function (a) {
	return {ctor: 'Perform', _0: a};
};
var _elm_lang$core$Task$perform = F2(
	function (toMessage, task) {
		return _elm_lang$core$Task$command(
			_elm_lang$core$Task$Perform(
				A2(_elm_lang$core$Task$map, toMessage, task)));
	});
var _elm_lang$core$Task$attempt = F2(
	function (resultToMessage, task) {
		return _elm_lang$core$Task$command(
			_elm_lang$core$Task$Perform(
				A2(
					_elm_lang$core$Task$onError,
					function (_p8) {
						return _elm_lang$core$Task$succeed(
							resultToMessage(
								_elm_lang$core$Result$Err(_p8)));
					},
					A2(
						_elm_lang$core$Task$andThen,
						function (_p9) {
							return _elm_lang$core$Task$succeed(
								resultToMessage(
									_elm_lang$core$Result$Ok(_p9)));
						},
						task))));
	});
var _elm_lang$core$Task$cmdMap = F2(
	function (tagger, _p10) {
		var _p11 = _p10;
		return _elm_lang$core$Task$Perform(
			A2(_elm_lang$core$Task$map, tagger, _p11._0));
	});
_elm_lang$core$Native_Platform.effectManagers['Task'] = {pkg: 'elm-lang/core', init: _elm_lang$core$Task$init, onEffects: _elm_lang$core$Task$onEffects, onSelfMsg: _elm_lang$core$Task$onSelfMsg, tag: 'cmd', cmdMap: _elm_lang$core$Task$cmdMap};

//import Native.Utils //

var _elm_lang$core$Native_Debug = function() {

function log(tag, value)
{
	var msg = tag + ': ' + _elm_lang$core$Native_Utils.toString(value);
	var process = process || {};
	if (process.stdout)
	{
		process.stdout.write(msg);
	}
	else
	{
		console.log(msg);
	}
	return value;
}

function crash(message)
{
	throw new Error(message);
}

return {
	crash: crash,
	log: F2(log)
};

}();
//import Maybe, Native.List, Native.Utils, Result //

var _elm_lang$core$Native_String = function() {

function isEmpty(str)
{
	return str.length === 0;
}
function cons(chr, str)
{
	return chr + str;
}
function uncons(str)
{
	var hd = str[0];
	if (hd)
	{
		return _elm_lang$core$Maybe$Just(_elm_lang$core$Native_Utils.Tuple2(_elm_lang$core$Native_Utils.chr(hd), str.slice(1)));
	}
	return _elm_lang$core$Maybe$Nothing;
}
function append(a, b)
{
	return a + b;
}
function concat(strs)
{
	return _elm_lang$core$Native_List.toArray(strs).join('');
}
function length(str)
{
	return str.length;
}
function map(f, str)
{
	var out = str.split('');
	for (var i = out.length; i--; )
	{
		out[i] = f(_elm_lang$core$Native_Utils.chr(out[i]));
	}
	return out.join('');
}
function filter(pred, str)
{
	return str.split('').map(_elm_lang$core$Native_Utils.chr).filter(pred).join('');
}
function reverse(str)
{
	return str.split('').reverse().join('');
}
function foldl(f, b, str)
{
	var len = str.length;
	for (var i = 0; i < len; ++i)
	{
		b = A2(f, _elm_lang$core$Native_Utils.chr(str[i]), b);
	}
	return b;
}
function foldr(f, b, str)
{
	for (var i = str.length; i--; )
	{
		b = A2(f, _elm_lang$core$Native_Utils.chr(str[i]), b);
	}
	return b;
}
function split(sep, str)
{
	return _elm_lang$core$Native_List.fromArray(str.split(sep));
}
function join(sep, strs)
{
	return _elm_lang$core$Native_List.toArray(strs).join(sep);
}
function repeat(n, str)
{
	var result = '';
	while (n > 0)
	{
		if (n & 1)
		{
			result += str;
		}
		n >>= 1, str += str;
	}
	return result;
}
function slice(start, end, str)
{
	return str.slice(start, end);
}
function left(n, str)
{
	return n < 1 ? '' : str.slice(0, n);
}
function right(n, str)
{
	return n < 1 ? '' : str.slice(-n);
}
function dropLeft(n, str)
{
	return n < 1 ? str : str.slice(n);
}
function dropRight(n, str)
{
	return n < 1 ? str : str.slice(0, -n);
}
function pad(n, chr, str)
{
	var half = (n - str.length) / 2;
	return repeat(Math.ceil(half), chr) + str + repeat(half | 0, chr);
}
function padRight(n, chr, str)
{
	return str + repeat(n - str.length, chr);
}
function padLeft(n, chr, str)
{
	return repeat(n - str.length, chr) + str;
}

function trim(str)
{
	return str.trim();
}
function trimLeft(str)
{
	return str.replace(/^\s+/, '');
}
function trimRight(str)
{
	return str.replace(/\s+$/, '');
}

function words(str)
{
	return _elm_lang$core$Native_List.fromArray(str.trim().split(/\s+/g));
}
function lines(str)
{
	return _elm_lang$core$Native_List.fromArray(str.split(/\r\n|\r|\n/g));
}

function toUpper(str)
{
	return str.toUpperCase();
}
function toLower(str)
{
	return str.toLowerCase();
}

function any(pred, str)
{
	for (var i = str.length; i--; )
	{
		if (pred(_elm_lang$core$Native_Utils.chr(str[i])))
		{
			return true;
		}
	}
	return false;
}
function all(pred, str)
{
	for (var i = str.length; i--; )
	{
		if (!pred(_elm_lang$core$Native_Utils.chr(str[i])))
		{
			return false;
		}
	}
	return true;
}

function contains(sub, str)
{
	return str.indexOf(sub) > -1;
}
function startsWith(sub, str)
{
	return str.indexOf(sub) === 0;
}
function endsWith(sub, str)
{
	return str.length >= sub.length &&
		str.lastIndexOf(sub) === str.length - sub.length;
}
function indexes(sub, str)
{
	var subLen = sub.length;

	if (subLen < 1)
	{
		return _elm_lang$core$Native_List.Nil;
	}

	var i = 0;
	var is = [];

	while ((i = str.indexOf(sub, i)) > -1)
	{
		is.push(i);
		i = i + subLen;
	}

	return _elm_lang$core$Native_List.fromArray(is);
}


function toInt(s)
{
	var len = s.length;

	// if empty
	if (len === 0)
	{
		return intErr(s);
	}

	// if hex
	var c = s[0];
	if (c === '0' && s[1] === 'x')
	{
		for (var i = 2; i < len; ++i)
		{
			var c = s[i];
			if (('0' <= c && c <= '9') || ('A' <= c && c <= 'F') || ('a' <= c && c <= 'f'))
			{
				continue;
			}
			return intErr(s);
		}
		return _elm_lang$core$Result$Ok(parseInt(s, 16));
	}

	// is decimal
	if (c > '9' || (c < '0' && c !== '-' && c !== '+'))
	{
		return intErr(s);
	}
	for (var i = 1; i < len; ++i)
	{
		var c = s[i];
		if (c < '0' || '9' < c)
		{
			return intErr(s);
		}
	}

	return _elm_lang$core$Result$Ok(parseInt(s, 10));
}

function intErr(s)
{
	return _elm_lang$core$Result$Err("could not convert string '" + s + "' to an Int");
}


function toFloat(s)
{
	// check if it is a hex, octal, or binary number
	if (s.length === 0 || /[\sxbo]/.test(s))
	{
		return floatErr(s);
	}
	var n = +s;
	// faster isNaN check
	return n === n ? _elm_lang$core$Result$Ok(n) : floatErr(s);
}

function floatErr(s)
{
	return _elm_lang$core$Result$Err("could not convert string '" + s + "' to a Float");
}


function toList(str)
{
	return _elm_lang$core$Native_List.fromArray(str.split('').map(_elm_lang$core$Native_Utils.chr));
}
function fromList(chars)
{
	return _elm_lang$core$Native_List.toArray(chars).join('');
}

return {
	isEmpty: isEmpty,
	cons: F2(cons),
	uncons: uncons,
	append: F2(append),
	concat: concat,
	length: length,
	map: F2(map),
	filter: F2(filter),
	reverse: reverse,
	foldl: F3(foldl),
	foldr: F3(foldr),

	split: F2(split),
	join: F2(join),
	repeat: F2(repeat),

	slice: F3(slice),
	left: F2(left),
	right: F2(right),
	dropLeft: F2(dropLeft),
	dropRight: F2(dropRight),

	pad: F3(pad),
	padLeft: F3(padLeft),
	padRight: F3(padRight),

	trim: trim,
	trimLeft: trimLeft,
	trimRight: trimRight,

	words: words,
	lines: lines,

	toUpper: toUpper,
	toLower: toLower,

	any: F2(any),
	all: F2(all),

	contains: F2(contains),
	startsWith: F2(startsWith),
	endsWith: F2(endsWith),
	indexes: F2(indexes),

	toInt: toInt,
	toFloat: toFloat,
	toList: toList,
	fromList: fromList
};

}();

var _elm_lang$core$String$fromList = _elm_lang$core$Native_String.fromList;
var _elm_lang$core$String$toList = _elm_lang$core$Native_String.toList;
var _elm_lang$core$String$toFloat = _elm_lang$core$Native_String.toFloat;
var _elm_lang$core$String$toInt = _elm_lang$core$Native_String.toInt;
var _elm_lang$core$String$indices = _elm_lang$core$Native_String.indexes;
var _elm_lang$core$String$indexes = _elm_lang$core$Native_String.indexes;
var _elm_lang$core$String$endsWith = _elm_lang$core$Native_String.endsWith;
var _elm_lang$core$String$startsWith = _elm_lang$core$Native_String.startsWith;
var _elm_lang$core$String$contains = _elm_lang$core$Native_String.contains;
var _elm_lang$core$String$all = _elm_lang$core$Native_String.all;
var _elm_lang$core$String$any = _elm_lang$core$Native_String.any;
var _elm_lang$core$String$toLower = _elm_lang$core$Native_String.toLower;
var _elm_lang$core$String$toUpper = _elm_lang$core$Native_String.toUpper;
var _elm_lang$core$String$lines = _elm_lang$core$Native_String.lines;
var _elm_lang$core$String$words = _elm_lang$core$Native_String.words;
var _elm_lang$core$String$trimRight = _elm_lang$core$Native_String.trimRight;
var _elm_lang$core$String$trimLeft = _elm_lang$core$Native_String.trimLeft;
var _elm_lang$core$String$trim = _elm_lang$core$Native_String.trim;
var _elm_lang$core$String$padRight = _elm_lang$core$Native_String.padRight;
var _elm_lang$core$String$padLeft = _elm_lang$core$Native_String.padLeft;
var _elm_lang$core$String$pad = _elm_lang$core$Native_String.pad;
var _elm_lang$core$String$dropRight = _elm_lang$core$Native_String.dropRight;
var _elm_lang$core$String$dropLeft = _elm_lang$core$Native_String.dropLeft;
var _elm_lang$core$String$right = _elm_lang$core$Native_String.right;
var _elm_lang$core$String$left = _elm_lang$core$Native_String.left;
var _elm_lang$core$String$slice = _elm_lang$core$Native_String.slice;
var _elm_lang$core$String$repeat = _elm_lang$core$Native_String.repeat;
var _elm_lang$core$String$join = _elm_lang$core$Native_String.join;
var _elm_lang$core$String$split = _elm_lang$core$Native_String.split;
var _elm_lang$core$String$foldr = _elm_lang$core$Native_String.foldr;
var _elm_lang$core$String$foldl = _elm_lang$core$Native_String.foldl;
var _elm_lang$core$String$reverse = _elm_lang$core$Native_String.reverse;
var _elm_lang$core$String$filter = _elm_lang$core$Native_String.filter;
var _elm_lang$core$String$map = _elm_lang$core$Native_String.map;
var _elm_lang$core$String$length = _elm_lang$core$Native_String.length;
var _elm_lang$core$String$concat = _elm_lang$core$Native_String.concat;
var _elm_lang$core$String$append = _elm_lang$core$Native_String.append;
var _elm_lang$core$String$uncons = _elm_lang$core$Native_String.uncons;
var _elm_lang$core$String$cons = _elm_lang$core$Native_String.cons;
var _elm_lang$core$String$fromChar = function ($char) {
	return A2(_elm_lang$core$String$cons, $char, '');
};
var _elm_lang$core$String$isEmpty = _elm_lang$core$Native_String.isEmpty;

var _elm_lang$core$Dict$foldr = F3(
	function (f, acc, t) {
		foldr:
		while (true) {
			var _p0 = t;
			if (_p0.ctor === 'RBEmpty_elm_builtin') {
				return acc;
			} else {
				var _v1 = f,
					_v2 = A3(
					f,
					_p0._1,
					_p0._2,
					A3(_elm_lang$core$Dict$foldr, f, acc, _p0._4)),
					_v3 = _p0._3;
				f = _v1;
				acc = _v2;
				t = _v3;
				continue foldr;
			}
		}
	});
var _elm_lang$core$Dict$keys = function (dict) {
	return A3(
		_elm_lang$core$Dict$foldr,
		F3(
			function (key, value, keyList) {
				return {ctor: '::', _0: key, _1: keyList};
			}),
		{ctor: '[]'},
		dict);
};
var _elm_lang$core$Dict$values = function (dict) {
	return A3(
		_elm_lang$core$Dict$foldr,
		F3(
			function (key, value, valueList) {
				return {ctor: '::', _0: value, _1: valueList};
			}),
		{ctor: '[]'},
		dict);
};
var _elm_lang$core$Dict$toList = function (dict) {
	return A3(
		_elm_lang$core$Dict$foldr,
		F3(
			function (key, value, list) {
				return {
					ctor: '::',
					_0: {ctor: '_Tuple2', _0: key, _1: value},
					_1: list
				};
			}),
		{ctor: '[]'},
		dict);
};
var _elm_lang$core$Dict$foldl = F3(
	function (f, acc, dict) {
		foldl:
		while (true) {
			var _p1 = dict;
			if (_p1.ctor === 'RBEmpty_elm_builtin') {
				return acc;
			} else {
				var _v5 = f,
					_v6 = A3(
					f,
					_p1._1,
					_p1._2,
					A3(_elm_lang$core$Dict$foldl, f, acc, _p1._3)),
					_v7 = _p1._4;
				f = _v5;
				acc = _v6;
				dict = _v7;
				continue foldl;
			}
		}
	});
var _elm_lang$core$Dict$merge = F6(
	function (leftStep, bothStep, rightStep, leftDict, rightDict, initialResult) {
		var stepState = F3(
			function (rKey, rValue, _p2) {
				stepState:
				while (true) {
					var _p3 = _p2;
					var _p9 = _p3._1;
					var _p8 = _p3._0;
					var _p4 = _p8;
					if (_p4.ctor === '[]') {
						return {
							ctor: '_Tuple2',
							_0: _p8,
							_1: A3(rightStep, rKey, rValue, _p9)
						};
					} else {
						var _p7 = _p4._1;
						var _p6 = _p4._0._1;
						var _p5 = _p4._0._0;
						if (_elm_lang$core$Native_Utils.cmp(_p5, rKey) < 0) {
							var _v10 = rKey,
								_v11 = rValue,
								_v12 = {
								ctor: '_Tuple2',
								_0: _p7,
								_1: A3(leftStep, _p5, _p6, _p9)
							};
							rKey = _v10;
							rValue = _v11;
							_p2 = _v12;
							continue stepState;
						} else {
							if (_elm_lang$core$Native_Utils.cmp(_p5, rKey) > 0) {
								return {
									ctor: '_Tuple2',
									_0: _p8,
									_1: A3(rightStep, rKey, rValue, _p9)
								};
							} else {
								return {
									ctor: '_Tuple2',
									_0: _p7,
									_1: A4(bothStep, _p5, _p6, rValue, _p9)
								};
							}
						}
					}
				}
			});
		var _p10 = A3(
			_elm_lang$core$Dict$foldl,
			stepState,
			{
				ctor: '_Tuple2',
				_0: _elm_lang$core$Dict$toList(leftDict),
				_1: initialResult
			},
			rightDict);
		var leftovers = _p10._0;
		var intermediateResult = _p10._1;
		return A3(
			_elm_lang$core$List$foldl,
			F2(
				function (_p11, result) {
					var _p12 = _p11;
					return A3(leftStep, _p12._0, _p12._1, result);
				}),
			intermediateResult,
			leftovers);
	});
var _elm_lang$core$Dict$reportRemBug = F4(
	function (msg, c, lgot, rgot) {
		return _elm_lang$core$Native_Debug.crash(
			_elm_lang$core$String$concat(
				{
					ctor: '::',
					_0: 'Internal red-black tree invariant violated, expected ',
					_1: {
						ctor: '::',
						_0: msg,
						_1: {
							ctor: '::',
							_0: ' and got ',
							_1: {
								ctor: '::',
								_0: _elm_lang$core$Basics$toString(c),
								_1: {
									ctor: '::',
									_0: '/',
									_1: {
										ctor: '::',
										_0: lgot,
										_1: {
											ctor: '::',
											_0: '/',
											_1: {
												ctor: '::',
												_0: rgot,
												_1: {
													ctor: '::',
													_0: '\nPlease report this bug to <https://github.com/elm-lang/core/issues>',
													_1: {ctor: '[]'}
												}
											}
										}
									}
								}
							}
						}
					}
				}));
	});
var _elm_lang$core$Dict$isBBlack = function (dict) {
	var _p13 = dict;
	_v14_2:
	do {
		if (_p13.ctor === 'RBNode_elm_builtin') {
			if (_p13._0.ctor === 'BBlack') {
				return true;
			} else {
				break _v14_2;
			}
		} else {
			if (_p13._0.ctor === 'LBBlack') {
				return true;
			} else {
				break _v14_2;
			}
		}
	} while(false);
	return false;
};
var _elm_lang$core$Dict$sizeHelp = F2(
	function (n, dict) {
		sizeHelp:
		while (true) {
			var _p14 = dict;
			if (_p14.ctor === 'RBEmpty_elm_builtin') {
				return n;
			} else {
				var _v16 = A2(_elm_lang$core$Dict$sizeHelp, n + 1, _p14._4),
					_v17 = _p14._3;
				n = _v16;
				dict = _v17;
				continue sizeHelp;
			}
		}
	});
var _elm_lang$core$Dict$size = function (dict) {
	return A2(_elm_lang$core$Dict$sizeHelp, 0, dict);
};
var _elm_lang$core$Dict$get = F2(
	function (targetKey, dict) {
		get:
		while (true) {
			var _p15 = dict;
			if (_p15.ctor === 'RBEmpty_elm_builtin') {
				return _elm_lang$core$Maybe$Nothing;
			} else {
				var _p16 = A2(_elm_lang$core$Basics$compare, targetKey, _p15._1);
				switch (_p16.ctor) {
					case 'LT':
						var _v20 = targetKey,
							_v21 = _p15._3;
						targetKey = _v20;
						dict = _v21;
						continue get;
					case 'EQ':
						return _elm_lang$core$Maybe$Just(_p15._2);
					default:
						var _v22 = targetKey,
							_v23 = _p15._4;
						targetKey = _v22;
						dict = _v23;
						continue get;
				}
			}
		}
	});
var _elm_lang$core$Dict$member = F2(
	function (key, dict) {
		var _p17 = A2(_elm_lang$core$Dict$get, key, dict);
		if (_p17.ctor === 'Just') {
			return true;
		} else {
			return false;
		}
	});
var _elm_lang$core$Dict$maxWithDefault = F3(
	function (k, v, r) {
		maxWithDefault:
		while (true) {
			var _p18 = r;
			if (_p18.ctor === 'RBEmpty_elm_builtin') {
				return {ctor: '_Tuple2', _0: k, _1: v};
			} else {
				var _v26 = _p18._1,
					_v27 = _p18._2,
					_v28 = _p18._4;
				k = _v26;
				v = _v27;
				r = _v28;
				continue maxWithDefault;
			}
		}
	});
var _elm_lang$core$Dict$NBlack = {ctor: 'NBlack'};
var _elm_lang$core$Dict$BBlack = {ctor: 'BBlack'};
var _elm_lang$core$Dict$Black = {ctor: 'Black'};
var _elm_lang$core$Dict$blackish = function (t) {
	var _p19 = t;
	if (_p19.ctor === 'RBNode_elm_builtin') {
		var _p20 = _p19._0;
		return _elm_lang$core$Native_Utils.eq(_p20, _elm_lang$core$Dict$Black) || _elm_lang$core$Native_Utils.eq(_p20, _elm_lang$core$Dict$BBlack);
	} else {
		return true;
	}
};
var _elm_lang$core$Dict$Red = {ctor: 'Red'};
var _elm_lang$core$Dict$moreBlack = function (color) {
	var _p21 = color;
	switch (_p21.ctor) {
		case 'Black':
			return _elm_lang$core$Dict$BBlack;
		case 'Red':
			return _elm_lang$core$Dict$Black;
		case 'NBlack':
			return _elm_lang$core$Dict$Red;
		default:
			return _elm_lang$core$Native_Debug.crash('Can\'t make a double black node more black!');
	}
};
var _elm_lang$core$Dict$lessBlack = function (color) {
	var _p22 = color;
	switch (_p22.ctor) {
		case 'BBlack':
			return _elm_lang$core$Dict$Black;
		case 'Black':
			return _elm_lang$core$Dict$Red;
		case 'Red':
			return _elm_lang$core$Dict$NBlack;
		default:
			return _elm_lang$core$Native_Debug.crash('Can\'t make a negative black node less black!');
	}
};
var _elm_lang$core$Dict$LBBlack = {ctor: 'LBBlack'};
var _elm_lang$core$Dict$LBlack = {ctor: 'LBlack'};
var _elm_lang$core$Dict$RBEmpty_elm_builtin = function (a) {
	return {ctor: 'RBEmpty_elm_builtin', _0: a};
};
var _elm_lang$core$Dict$empty = _elm_lang$core$Dict$RBEmpty_elm_builtin(_elm_lang$core$Dict$LBlack);
var _elm_lang$core$Dict$isEmpty = function (dict) {
	return _elm_lang$core$Native_Utils.eq(dict, _elm_lang$core$Dict$empty);
};
var _elm_lang$core$Dict$RBNode_elm_builtin = F5(
	function (a, b, c, d, e) {
		return {ctor: 'RBNode_elm_builtin', _0: a, _1: b, _2: c, _3: d, _4: e};
	});
var _elm_lang$core$Dict$ensureBlackRoot = function (dict) {
	var _p23 = dict;
	if ((_p23.ctor === 'RBNode_elm_builtin') && (_p23._0.ctor === 'Red')) {
		return A5(_elm_lang$core$Dict$RBNode_elm_builtin, _elm_lang$core$Dict$Black, _p23._1, _p23._2, _p23._3, _p23._4);
	} else {
		return dict;
	}
};
var _elm_lang$core$Dict$lessBlackTree = function (dict) {
	var _p24 = dict;
	if (_p24.ctor === 'RBNode_elm_builtin') {
		return A5(
			_elm_lang$core$Dict$RBNode_elm_builtin,
			_elm_lang$core$Dict$lessBlack(_p24._0),
			_p24._1,
			_p24._2,
			_p24._3,
			_p24._4);
	} else {
		return _elm_lang$core$Dict$RBEmpty_elm_builtin(_elm_lang$core$Dict$LBlack);
	}
};
var _elm_lang$core$Dict$balancedTree = function (col) {
	return function (xk) {
		return function (xv) {
			return function (yk) {
				return function (yv) {
					return function (zk) {
						return function (zv) {
							return function (a) {
								return function (b) {
									return function (c) {
										return function (d) {
											return A5(
												_elm_lang$core$Dict$RBNode_elm_builtin,
												_elm_lang$core$Dict$lessBlack(col),
												yk,
												yv,
												A5(_elm_lang$core$Dict$RBNode_elm_builtin, _elm_lang$core$Dict$Black, xk, xv, a, b),
												A5(_elm_lang$core$Dict$RBNode_elm_builtin, _elm_lang$core$Dict$Black, zk, zv, c, d));
										};
									};
								};
							};
						};
					};
				};
			};
		};
	};
};
var _elm_lang$core$Dict$blacken = function (t) {
	var _p25 = t;
	if (_p25.ctor === 'RBEmpty_elm_builtin') {
		return _elm_lang$core$Dict$RBEmpty_elm_builtin(_elm_lang$core$Dict$LBlack);
	} else {
		return A5(_elm_lang$core$Dict$RBNode_elm_builtin, _elm_lang$core$Dict$Black, _p25._1, _p25._2, _p25._3, _p25._4);
	}
};
var _elm_lang$core$Dict$redden = function (t) {
	var _p26 = t;
	if (_p26.ctor === 'RBEmpty_elm_builtin') {
		return _elm_lang$core$Native_Debug.crash('can\'t make a Leaf red');
	} else {
		return A5(_elm_lang$core$Dict$RBNode_elm_builtin, _elm_lang$core$Dict$Red, _p26._1, _p26._2, _p26._3, _p26._4);
	}
};
var _elm_lang$core$Dict$balanceHelp = function (tree) {
	var _p27 = tree;
	_v36_6:
	do {
		_v36_5:
		do {
			_v36_4:
			do {
				_v36_3:
				do {
					_v36_2:
					do {
						_v36_1:
						do {
							_v36_0:
							do {
								if (_p27.ctor === 'RBNode_elm_builtin') {
									if (_p27._3.ctor === 'RBNode_elm_builtin') {
										if (_p27._4.ctor === 'RBNode_elm_builtin') {
											switch (_p27._3._0.ctor) {
												case 'Red':
													switch (_p27._4._0.ctor) {
														case 'Red':
															if ((_p27._3._3.ctor === 'RBNode_elm_builtin') && (_p27._3._3._0.ctor === 'Red')) {
																break _v36_0;
															} else {
																if ((_p27._3._4.ctor === 'RBNode_elm_builtin') && (_p27._3._4._0.ctor === 'Red')) {
																	break _v36_1;
																} else {
																	if ((_p27._4._3.ctor === 'RBNode_elm_builtin') && (_p27._4._3._0.ctor === 'Red')) {
																		break _v36_2;
																	} else {
																		if ((_p27._4._4.ctor === 'RBNode_elm_builtin') && (_p27._4._4._0.ctor === 'Red')) {
																			break _v36_3;
																		} else {
																			break _v36_6;
																		}
																	}
																}
															}
														case 'NBlack':
															if ((_p27._3._3.ctor === 'RBNode_elm_builtin') && (_p27._3._3._0.ctor === 'Red')) {
																break _v36_0;
															} else {
																if ((_p27._3._4.ctor === 'RBNode_elm_builtin') && (_p27._3._4._0.ctor === 'Red')) {
																	break _v36_1;
																} else {
																	if (((((_p27._0.ctor === 'BBlack') && (_p27._4._3.ctor === 'RBNode_elm_builtin')) && (_p27._4._3._0.ctor === 'Black')) && (_p27._4._4.ctor === 'RBNode_elm_builtin')) && (_p27._4._4._0.ctor === 'Black')) {
																		break _v36_4;
																	} else {
																		break _v36_6;
																	}
																}
															}
														default:
															if ((_p27._3._3.ctor === 'RBNode_elm_builtin') && (_p27._3._3._0.ctor === 'Red')) {
																break _v36_0;
															} else {
																if ((_p27._3._4.ctor === 'RBNode_elm_builtin') && (_p27._3._4._0.ctor === 'Red')) {
																	break _v36_1;
																} else {
																	break _v36_6;
																}
															}
													}
												case 'NBlack':
													switch (_p27._4._0.ctor) {
														case 'Red':
															if ((_p27._4._3.ctor === 'RBNode_elm_builtin') && (_p27._4._3._0.ctor === 'Red')) {
																break _v36_2;
															} else {
																if ((_p27._4._4.ctor === 'RBNode_elm_builtin') && (_p27._4._4._0.ctor === 'Red')) {
																	break _v36_3;
																} else {
																	if (((((_p27._0.ctor === 'BBlack') && (_p27._3._3.ctor === 'RBNode_elm_builtin')) && (_p27._3._3._0.ctor === 'Black')) && (_p27._3._4.ctor === 'RBNode_elm_builtin')) && (_p27._3._4._0.ctor === 'Black')) {
																		break _v36_5;
																	} else {
																		break _v36_6;
																	}
																}
															}
														case 'NBlack':
															if (_p27._0.ctor === 'BBlack') {
																if ((((_p27._4._3.ctor === 'RBNode_elm_builtin') && (_p27._4._3._0.ctor === 'Black')) && (_p27._4._4.ctor === 'RBNode_elm_builtin')) && (_p27._4._4._0.ctor === 'Black')) {
																	break _v36_4;
																} else {
																	if ((((_p27._3._3.ctor === 'RBNode_elm_builtin') && (_p27._3._3._0.ctor === 'Black')) && (_p27._3._4.ctor === 'RBNode_elm_builtin')) && (_p27._3._4._0.ctor === 'Black')) {
																		break _v36_5;
																	} else {
																		break _v36_6;
																	}
																}
															} else {
																break _v36_6;
															}
														default:
															if (((((_p27._0.ctor === 'BBlack') && (_p27._3._3.ctor === 'RBNode_elm_builtin')) && (_p27._3._3._0.ctor === 'Black')) && (_p27._3._4.ctor === 'RBNode_elm_builtin')) && (_p27._3._4._0.ctor === 'Black')) {
																break _v36_5;
															} else {
																break _v36_6;
															}
													}
												default:
													switch (_p27._4._0.ctor) {
														case 'Red':
															if ((_p27._4._3.ctor === 'RBNode_elm_builtin') && (_p27._4._3._0.ctor === 'Red')) {
																break _v36_2;
															} else {
																if ((_p27._4._4.ctor === 'RBNode_elm_builtin') && (_p27._4._4._0.ctor === 'Red')) {
																	break _v36_3;
																} else {
																	break _v36_6;
																}
															}
														case 'NBlack':
															if (((((_p27._0.ctor === 'BBlack') && (_p27._4._3.ctor === 'RBNode_elm_builtin')) && (_p27._4._3._0.ctor === 'Black')) && (_p27._4._4.ctor === 'RBNode_elm_builtin')) && (_p27._4._4._0.ctor === 'Black')) {
																break _v36_4;
															} else {
																break _v36_6;
															}
														default:
															break _v36_6;
													}
											}
										} else {
											switch (_p27._3._0.ctor) {
												case 'Red':
													if ((_p27._3._3.ctor === 'RBNode_elm_builtin') && (_p27._3._3._0.ctor === 'Red')) {
														break _v36_0;
													} else {
														if ((_p27._3._4.ctor === 'RBNode_elm_builtin') && (_p27._3._4._0.ctor === 'Red')) {
															break _v36_1;
														} else {
															break _v36_6;
														}
													}
												case 'NBlack':
													if (((((_p27._0.ctor === 'BBlack') && (_p27._3._3.ctor === 'RBNode_elm_builtin')) && (_p27._3._3._0.ctor === 'Black')) && (_p27._3._4.ctor === 'RBNode_elm_builtin')) && (_p27._3._4._0.ctor === 'Black')) {
														break _v36_5;
													} else {
														break _v36_6;
													}
												default:
													break _v36_6;
											}
										}
									} else {
										if (_p27._4.ctor === 'RBNode_elm_builtin') {
											switch (_p27._4._0.ctor) {
												case 'Red':
													if ((_p27._4._3.ctor === 'RBNode_elm_builtin') && (_p27._4._3._0.ctor === 'Red')) {
														break _v36_2;
													} else {
														if ((_p27._4._4.ctor === 'RBNode_elm_builtin') && (_p27._4._4._0.ctor === 'Red')) {
															break _v36_3;
														} else {
															break _v36_6;
														}
													}
												case 'NBlack':
													if (((((_p27._0.ctor === 'BBlack') && (_p27._4._3.ctor === 'RBNode_elm_builtin')) && (_p27._4._3._0.ctor === 'Black')) && (_p27._4._4.ctor === 'RBNode_elm_builtin')) && (_p27._4._4._0.ctor === 'Black')) {
														break _v36_4;
													} else {
														break _v36_6;
													}
												default:
													break _v36_6;
											}
										} else {
											break _v36_6;
										}
									}
								} else {
									break _v36_6;
								}
							} while(false);
							return _elm_lang$core$Dict$balancedTree(_p27._0)(_p27._3._3._1)(_p27._3._3._2)(_p27._3._1)(_p27._3._2)(_p27._1)(_p27._2)(_p27._3._3._3)(_p27._3._3._4)(_p27._3._4)(_p27._4);
						} while(false);
						return _elm_lang$core$Dict$balancedTree(_p27._0)(_p27._3._1)(_p27._3._2)(_p27._3._4._1)(_p27._3._4._2)(_p27._1)(_p27._2)(_p27._3._3)(_p27._3._4._3)(_p27._3._4._4)(_p27._4);
					} while(false);
					return _elm_lang$core$Dict$balancedTree(_p27._0)(_p27._1)(_p27._2)(_p27._4._3._1)(_p27._4._3._2)(_p27._4._1)(_p27._4._2)(_p27._3)(_p27._4._3._3)(_p27._4._3._4)(_p27._4._4);
				} while(false);
				return _elm_lang$core$Dict$balancedTree(_p27._0)(_p27._1)(_p27._2)(_p27._4._1)(_p27._4._2)(_p27._4._4._1)(_p27._4._4._2)(_p27._3)(_p27._4._3)(_p27._4._4._3)(_p27._4._4._4);
			} while(false);
			return A5(
				_elm_lang$core$Dict$RBNode_elm_builtin,
				_elm_lang$core$Dict$Black,
				_p27._4._3._1,
				_p27._4._3._2,
				A5(_elm_lang$core$Dict$RBNode_elm_builtin, _elm_lang$core$Dict$Black, _p27._1, _p27._2, _p27._3, _p27._4._3._3),
				A5(
					_elm_lang$core$Dict$balance,
					_elm_lang$core$Dict$Black,
					_p27._4._1,
					_p27._4._2,
					_p27._4._3._4,
					_elm_lang$core$Dict$redden(_p27._4._4)));
		} while(false);
		return A5(
			_elm_lang$core$Dict$RBNode_elm_builtin,
			_elm_lang$core$Dict$Black,
			_p27._3._4._1,
			_p27._3._4._2,
			A5(
				_elm_lang$core$Dict$balance,
				_elm_lang$core$Dict$Black,
				_p27._3._1,
				_p27._3._2,
				_elm_lang$core$Dict$redden(_p27._3._3),
				_p27._3._4._3),
			A5(_elm_lang$core$Dict$RBNode_elm_builtin, _elm_lang$core$Dict$Black, _p27._1, _p27._2, _p27._3._4._4, _p27._4));
	} while(false);
	return tree;
};
var _elm_lang$core$Dict$balance = F5(
	function (c, k, v, l, r) {
		var tree = A5(_elm_lang$core$Dict$RBNode_elm_builtin, c, k, v, l, r);
		return _elm_lang$core$Dict$blackish(tree) ? _elm_lang$core$Dict$balanceHelp(tree) : tree;
	});
var _elm_lang$core$Dict$bubble = F5(
	function (c, k, v, l, r) {
		return (_elm_lang$core$Dict$isBBlack(l) || _elm_lang$core$Dict$isBBlack(r)) ? A5(
			_elm_lang$core$Dict$balance,
			_elm_lang$core$Dict$moreBlack(c),
			k,
			v,
			_elm_lang$core$Dict$lessBlackTree(l),
			_elm_lang$core$Dict$lessBlackTree(r)) : A5(_elm_lang$core$Dict$RBNode_elm_builtin, c, k, v, l, r);
	});
var _elm_lang$core$Dict$removeMax = F5(
	function (c, k, v, l, r) {
		var _p28 = r;
		if (_p28.ctor === 'RBEmpty_elm_builtin') {
			return A3(_elm_lang$core$Dict$rem, c, l, r);
		} else {
			return A5(
				_elm_lang$core$Dict$bubble,
				c,
				k,
				v,
				l,
				A5(_elm_lang$core$Dict$removeMax, _p28._0, _p28._1, _p28._2, _p28._3, _p28._4));
		}
	});
var _elm_lang$core$Dict$rem = F3(
	function (color, left, right) {
		var _p29 = {ctor: '_Tuple2', _0: left, _1: right};
		if (_p29._0.ctor === 'RBEmpty_elm_builtin') {
			if (_p29._1.ctor === 'RBEmpty_elm_builtin') {
				var _p30 = color;
				switch (_p30.ctor) {
					case 'Red':
						return _elm_lang$core$Dict$RBEmpty_elm_builtin(_elm_lang$core$Dict$LBlack);
					case 'Black':
						return _elm_lang$core$Dict$RBEmpty_elm_builtin(_elm_lang$core$Dict$LBBlack);
					default:
						return _elm_lang$core$Native_Debug.crash('cannot have bblack or nblack nodes at this point');
				}
			} else {
				var _p33 = _p29._1._0;
				var _p32 = _p29._0._0;
				var _p31 = {ctor: '_Tuple3', _0: color, _1: _p32, _2: _p33};
				if ((((_p31.ctor === '_Tuple3') && (_p31._0.ctor === 'Black')) && (_p31._1.ctor === 'LBlack')) && (_p31._2.ctor === 'Red')) {
					return A5(_elm_lang$core$Dict$RBNode_elm_builtin, _elm_lang$core$Dict$Black, _p29._1._1, _p29._1._2, _p29._1._3, _p29._1._4);
				} else {
					return A4(
						_elm_lang$core$Dict$reportRemBug,
						'Black/LBlack/Red',
						color,
						_elm_lang$core$Basics$toString(_p32),
						_elm_lang$core$Basics$toString(_p33));
				}
			}
		} else {
			if (_p29._1.ctor === 'RBEmpty_elm_builtin') {
				var _p36 = _p29._1._0;
				var _p35 = _p29._0._0;
				var _p34 = {ctor: '_Tuple3', _0: color, _1: _p35, _2: _p36};
				if ((((_p34.ctor === '_Tuple3') && (_p34._0.ctor === 'Black')) && (_p34._1.ctor === 'Red')) && (_p34._2.ctor === 'LBlack')) {
					return A5(_elm_lang$core$Dict$RBNode_elm_builtin, _elm_lang$core$Dict$Black, _p29._0._1, _p29._0._2, _p29._0._3, _p29._0._4);
				} else {
					return A4(
						_elm_lang$core$Dict$reportRemBug,
						'Black/Red/LBlack',
						color,
						_elm_lang$core$Basics$toString(_p35),
						_elm_lang$core$Basics$toString(_p36));
				}
			} else {
				var _p40 = _p29._0._2;
				var _p39 = _p29._0._4;
				var _p38 = _p29._0._1;
				var newLeft = A5(_elm_lang$core$Dict$removeMax, _p29._0._0, _p38, _p40, _p29._0._3, _p39);
				var _p37 = A3(_elm_lang$core$Dict$maxWithDefault, _p38, _p40, _p39);
				var k = _p37._0;
				var v = _p37._1;
				return A5(_elm_lang$core$Dict$bubble, color, k, v, newLeft, right);
			}
		}
	});
var _elm_lang$core$Dict$map = F2(
	function (f, dict) {
		var _p41 = dict;
		if (_p41.ctor === 'RBEmpty_elm_builtin') {
			return _elm_lang$core$Dict$RBEmpty_elm_builtin(_elm_lang$core$Dict$LBlack);
		} else {
			var _p42 = _p41._1;
			return A5(
				_elm_lang$core$Dict$RBNode_elm_builtin,
				_p41._0,
				_p42,
				A2(f, _p42, _p41._2),
				A2(_elm_lang$core$Dict$map, f, _p41._3),
				A2(_elm_lang$core$Dict$map, f, _p41._4));
		}
	});
var _elm_lang$core$Dict$Same = {ctor: 'Same'};
var _elm_lang$core$Dict$Remove = {ctor: 'Remove'};
var _elm_lang$core$Dict$Insert = {ctor: 'Insert'};
var _elm_lang$core$Dict$update = F3(
	function (k, alter, dict) {
		var up = function (dict) {
			var _p43 = dict;
			if (_p43.ctor === 'RBEmpty_elm_builtin') {
				var _p44 = alter(_elm_lang$core$Maybe$Nothing);
				if (_p44.ctor === 'Nothing') {
					return {ctor: '_Tuple2', _0: _elm_lang$core$Dict$Same, _1: _elm_lang$core$Dict$empty};
				} else {
					return {
						ctor: '_Tuple2',
						_0: _elm_lang$core$Dict$Insert,
						_1: A5(_elm_lang$core$Dict$RBNode_elm_builtin, _elm_lang$core$Dict$Red, k, _p44._0, _elm_lang$core$Dict$empty, _elm_lang$core$Dict$empty)
					};
				}
			} else {
				var _p55 = _p43._2;
				var _p54 = _p43._4;
				var _p53 = _p43._3;
				var _p52 = _p43._1;
				var _p51 = _p43._0;
				var _p45 = A2(_elm_lang$core$Basics$compare, k, _p52);
				switch (_p45.ctor) {
					case 'EQ':
						var _p46 = alter(
							_elm_lang$core$Maybe$Just(_p55));
						if (_p46.ctor === 'Nothing') {
							return {
								ctor: '_Tuple2',
								_0: _elm_lang$core$Dict$Remove,
								_1: A3(_elm_lang$core$Dict$rem, _p51, _p53, _p54)
							};
						} else {
							return {
								ctor: '_Tuple2',
								_0: _elm_lang$core$Dict$Same,
								_1: A5(_elm_lang$core$Dict$RBNode_elm_builtin, _p51, _p52, _p46._0, _p53, _p54)
							};
						}
					case 'LT':
						var _p47 = up(_p53);
						var flag = _p47._0;
						var newLeft = _p47._1;
						var _p48 = flag;
						switch (_p48.ctor) {
							case 'Same':
								return {
									ctor: '_Tuple2',
									_0: _elm_lang$core$Dict$Same,
									_1: A5(_elm_lang$core$Dict$RBNode_elm_builtin, _p51, _p52, _p55, newLeft, _p54)
								};
							case 'Insert':
								return {
									ctor: '_Tuple2',
									_0: _elm_lang$core$Dict$Insert,
									_1: A5(_elm_lang$core$Dict$balance, _p51, _p52, _p55, newLeft, _p54)
								};
							default:
								return {
									ctor: '_Tuple2',
									_0: _elm_lang$core$Dict$Remove,
									_1: A5(_elm_lang$core$Dict$bubble, _p51, _p52, _p55, newLeft, _p54)
								};
						}
					default:
						var _p49 = up(_p54);
						var flag = _p49._0;
						var newRight = _p49._1;
						var _p50 = flag;
						switch (_p50.ctor) {
							case 'Same':
								return {
									ctor: '_Tuple2',
									_0: _elm_lang$core$Dict$Same,
									_1: A5(_elm_lang$core$Dict$RBNode_elm_builtin, _p51, _p52, _p55, _p53, newRight)
								};
							case 'Insert':
								return {
									ctor: '_Tuple2',
									_0: _elm_lang$core$Dict$Insert,
									_1: A5(_elm_lang$core$Dict$balance, _p51, _p52, _p55, _p53, newRight)
								};
							default:
								return {
									ctor: '_Tuple2',
									_0: _elm_lang$core$Dict$Remove,
									_1: A5(_elm_lang$core$Dict$bubble, _p51, _p52, _p55, _p53, newRight)
								};
						}
				}
			}
		};
		var _p56 = up(dict);
		var flag = _p56._0;
		var updatedDict = _p56._1;
		var _p57 = flag;
		switch (_p57.ctor) {
			case 'Same':
				return updatedDict;
			case 'Insert':
				return _elm_lang$core$Dict$ensureBlackRoot(updatedDict);
			default:
				return _elm_lang$core$Dict$blacken(updatedDict);
		}
	});
var _elm_lang$core$Dict$insert = F3(
	function (key, value, dict) {
		return A3(
			_elm_lang$core$Dict$update,
			key,
			_elm_lang$core$Basics$always(
				_elm_lang$core$Maybe$Just(value)),
			dict);
	});
var _elm_lang$core$Dict$singleton = F2(
	function (key, value) {
		return A3(_elm_lang$core$Dict$insert, key, value, _elm_lang$core$Dict$empty);
	});
var _elm_lang$core$Dict$union = F2(
	function (t1, t2) {
		return A3(_elm_lang$core$Dict$foldl, _elm_lang$core$Dict$insert, t2, t1);
	});
var _elm_lang$core$Dict$filter = F2(
	function (predicate, dictionary) {
		var add = F3(
			function (key, value, dict) {
				return A2(predicate, key, value) ? A3(_elm_lang$core$Dict$insert, key, value, dict) : dict;
			});
		return A3(_elm_lang$core$Dict$foldl, add, _elm_lang$core$Dict$empty, dictionary);
	});
var _elm_lang$core$Dict$intersect = F2(
	function (t1, t2) {
		return A2(
			_elm_lang$core$Dict$filter,
			F2(
				function (k, _p58) {
					return A2(_elm_lang$core$Dict$member, k, t2);
				}),
			t1);
	});
var _elm_lang$core$Dict$partition = F2(
	function (predicate, dict) {
		var add = F3(
			function (key, value, _p59) {
				var _p60 = _p59;
				var _p62 = _p60._1;
				var _p61 = _p60._0;
				return A2(predicate, key, value) ? {
					ctor: '_Tuple2',
					_0: A3(_elm_lang$core$Dict$insert, key, value, _p61),
					_1: _p62
				} : {
					ctor: '_Tuple2',
					_0: _p61,
					_1: A3(_elm_lang$core$Dict$insert, key, value, _p62)
				};
			});
		return A3(
			_elm_lang$core$Dict$foldl,
			add,
			{ctor: '_Tuple2', _0: _elm_lang$core$Dict$empty, _1: _elm_lang$core$Dict$empty},
			dict);
	});
var _elm_lang$core$Dict$fromList = function (assocs) {
	return A3(
		_elm_lang$core$List$foldl,
		F2(
			function (_p63, dict) {
				var _p64 = _p63;
				return A3(_elm_lang$core$Dict$insert, _p64._0, _p64._1, dict);
			}),
		_elm_lang$core$Dict$empty,
		assocs);
};
var _elm_lang$core$Dict$remove = F2(
	function (key, dict) {
		return A3(
			_elm_lang$core$Dict$update,
			key,
			_elm_lang$core$Basics$always(_elm_lang$core$Maybe$Nothing),
			dict);
	});
var _elm_lang$core$Dict$diff = F2(
	function (t1, t2) {
		return A3(
			_elm_lang$core$Dict$foldl,
			F3(
				function (k, v, t) {
					return A2(_elm_lang$core$Dict$remove, k, t);
				}),
			t1,
			t2);
	});

//import Native.Scheduler //

var _elm_lang$core$Native_Time = function() {

var now = _elm_lang$core$Native_Scheduler.nativeBinding(function(callback)
{
	callback(_elm_lang$core$Native_Scheduler.succeed(Date.now()));
});

function setInterval_(interval, task)
{
	return _elm_lang$core$Native_Scheduler.nativeBinding(function(callback)
	{
		var id = setInterval(function() {
			_elm_lang$core$Native_Scheduler.rawSpawn(task);
		}, interval);

		return function() { clearInterval(id); };
	});
}

return {
	now: now,
	setInterval_: F2(setInterval_)
};

}();
var _elm_lang$core$Time$setInterval = _elm_lang$core$Native_Time.setInterval_;
var _elm_lang$core$Time$spawnHelp = F3(
	function (router, intervals, processes) {
		var _p0 = intervals;
		if (_p0.ctor === '[]') {
			return _elm_lang$core$Task$succeed(processes);
		} else {
			var _p1 = _p0._0;
			var spawnRest = function (id) {
				return A3(
					_elm_lang$core$Time$spawnHelp,
					router,
					_p0._1,
					A3(_elm_lang$core$Dict$insert, _p1, id, processes));
			};
			var spawnTimer = _elm_lang$core$Native_Scheduler.spawn(
				A2(
					_elm_lang$core$Time$setInterval,
					_p1,
					A2(_elm_lang$core$Platform$sendToSelf, router, _p1)));
			return A2(_elm_lang$core$Task$andThen, spawnRest, spawnTimer);
		}
	});
var _elm_lang$core$Time$addMySub = F2(
	function (_p2, state) {
		var _p3 = _p2;
		var _p6 = _p3._1;
		var _p5 = _p3._0;
		var _p4 = A2(_elm_lang$core$Dict$get, _p5, state);
		if (_p4.ctor === 'Nothing') {
			return A3(
				_elm_lang$core$Dict$insert,
				_p5,
				{
					ctor: '::',
					_0: _p6,
					_1: {ctor: '[]'}
				},
				state);
		} else {
			return A3(
				_elm_lang$core$Dict$insert,
				_p5,
				{ctor: '::', _0: _p6, _1: _p4._0},
				state);
		}
	});
var _elm_lang$core$Time$inMilliseconds = function (t) {
	return t;
};
var _elm_lang$core$Time$millisecond = 1;
var _elm_lang$core$Time$second = 1000 * _elm_lang$core$Time$millisecond;
var _elm_lang$core$Time$minute = 60 * _elm_lang$core$Time$second;
var _elm_lang$core$Time$hour = 60 * _elm_lang$core$Time$minute;
var _elm_lang$core$Time$inHours = function (t) {
	return t / _elm_lang$core$Time$hour;
};
var _elm_lang$core$Time$inMinutes = function (t) {
	return t / _elm_lang$core$Time$minute;
};
var _elm_lang$core$Time$inSeconds = function (t) {
	return t / _elm_lang$core$Time$second;
};
var _elm_lang$core$Time$now = _elm_lang$core$Native_Time.now;
var _elm_lang$core$Time$onSelfMsg = F3(
	function (router, interval, state) {
		var _p7 = A2(_elm_lang$core$Dict$get, interval, state.taggers);
		if (_p7.ctor === 'Nothing') {
			return _elm_lang$core$Task$succeed(state);
		} else {
			var tellTaggers = function (time) {
				return _elm_lang$core$Task$sequence(
					A2(
						_elm_lang$core$List$map,
						function (tagger) {
							return A2(
								_elm_lang$core$Platform$sendToApp,
								router,
								tagger(time));
						},
						_p7._0));
			};
			return A2(
				_elm_lang$core$Task$andThen,
				function (_p8) {
					return _elm_lang$core$Task$succeed(state);
				},
				A2(_elm_lang$core$Task$andThen, tellTaggers, _elm_lang$core$Time$now));
		}
	});
var _elm_lang$core$Time$subscription = _elm_lang$core$Native_Platform.leaf('Time');
var _elm_lang$core$Time$State = F2(
	function (a, b) {
		return {taggers: a, processes: b};
	});
var _elm_lang$core$Time$init = _elm_lang$core$Task$succeed(
	A2(_elm_lang$core$Time$State, _elm_lang$core$Dict$empty, _elm_lang$core$Dict$empty));
var _elm_lang$core$Time$onEffects = F3(
	function (router, subs, _p9) {
		var _p10 = _p9;
		var rightStep = F3(
			function (_p12, id, _p11) {
				var _p13 = _p11;
				return {
					ctor: '_Tuple3',
					_0: _p13._0,
					_1: _p13._1,
					_2: A2(
						_elm_lang$core$Task$andThen,
						function (_p14) {
							return _p13._2;
						},
						_elm_lang$core$Native_Scheduler.kill(id))
				};
			});
		var bothStep = F4(
			function (interval, taggers, id, _p15) {
				var _p16 = _p15;
				return {
					ctor: '_Tuple3',
					_0: _p16._0,
					_1: A3(_elm_lang$core$Dict$insert, interval, id, _p16._1),
					_2: _p16._2
				};
			});
		var leftStep = F3(
			function (interval, taggers, _p17) {
				var _p18 = _p17;
				return {
					ctor: '_Tuple3',
					_0: {ctor: '::', _0: interval, _1: _p18._0},
					_1: _p18._1,
					_2: _p18._2
				};
			});
		var newTaggers = A3(_elm_lang$core$List$foldl, _elm_lang$core$Time$addMySub, _elm_lang$core$Dict$empty, subs);
		var _p19 = A6(
			_elm_lang$core$Dict$merge,
			leftStep,
			bothStep,
			rightStep,
			newTaggers,
			_p10.processes,
			{
				ctor: '_Tuple3',
				_0: {ctor: '[]'},
				_1: _elm_lang$core$Dict$empty,
				_2: _elm_lang$core$Task$succeed(
					{ctor: '_Tuple0'})
			});
		var spawnList = _p19._0;
		var existingDict = _p19._1;
		var killTask = _p19._2;
		return A2(
			_elm_lang$core$Task$andThen,
			function (newProcesses) {
				return _elm_lang$core$Task$succeed(
					A2(_elm_lang$core$Time$State, newTaggers, newProcesses));
			},
			A2(
				_elm_lang$core$Task$andThen,
				function (_p20) {
					return A3(_elm_lang$core$Time$spawnHelp, router, spawnList, existingDict);
				},
				killTask));
	});
var _elm_lang$core$Time$Every = F2(
	function (a, b) {
		return {ctor: 'Every', _0: a, _1: b};
	});
var _elm_lang$core$Time$every = F2(
	function (interval, tagger) {
		return _elm_lang$core$Time$subscription(
			A2(_elm_lang$core$Time$Every, interval, tagger));
	});
var _elm_lang$core$Time$subMap = F2(
	function (f, _p21) {
		var _p22 = _p21;
		return A2(
			_elm_lang$core$Time$Every,
			_p22._0,
			function (_p23) {
				return f(
					_p22._1(_p23));
			});
	});
_elm_lang$core$Native_Platform.effectManagers['Time'] = {pkg: 'elm-lang/core', init: _elm_lang$core$Time$init, onEffects: _elm_lang$core$Time$onEffects, onSelfMsg: _elm_lang$core$Time$onSelfMsg, tag: 'sub', subMap: _elm_lang$core$Time$subMap};

var _elm_lang$core$Debug$crash = _elm_lang$core$Native_Debug.crash;
var _elm_lang$core$Debug$log = _elm_lang$core$Native_Debug.log;

//import Maybe, Native.Array, Native.List, Native.Utils, Result //

var _elm_lang$core$Native_Json = function() {


// CORE DECODERS

function succeed(msg)
{
	return {
		ctor: '<decoder>',
		tag: 'succeed',
		msg: msg
	};
}

function fail(msg)
{
	return {
		ctor: '<decoder>',
		tag: 'fail',
		msg: msg
	};
}

function decodePrimitive(tag)
{
	return {
		ctor: '<decoder>',
		tag: tag
	};
}

function decodeContainer(tag, decoder)
{
	return {
		ctor: '<decoder>',
		tag: tag,
		decoder: decoder
	};
}

function decodeNull(value)
{
	return {
		ctor: '<decoder>',
		tag: 'null',
		value: value
	};
}

function decodeField(field, decoder)
{
	return {
		ctor: '<decoder>',
		tag: 'field',
		field: field,
		decoder: decoder
	};
}

function decodeIndex(index, decoder)
{
	return {
		ctor: '<decoder>',
		tag: 'index',
		index: index,
		decoder: decoder
	};
}

function decodeKeyValuePairs(decoder)
{
	return {
		ctor: '<decoder>',
		tag: 'key-value',
		decoder: decoder
	};
}

function mapMany(f, decoders)
{
	return {
		ctor: '<decoder>',
		tag: 'map-many',
		func: f,
		decoders: decoders
	};
}

function andThen(callback, decoder)
{
	return {
		ctor: '<decoder>',
		tag: 'andThen',
		decoder: decoder,
		callback: callback
	};
}

function oneOf(decoders)
{
	return {
		ctor: '<decoder>',
		tag: 'oneOf',
		decoders: decoders
	};
}


// DECODING OBJECTS

function map1(f, d1)
{
	return mapMany(f, [d1]);
}

function map2(f, d1, d2)
{
	return mapMany(f, [d1, d2]);
}

function map3(f, d1, d2, d3)
{
	return mapMany(f, [d1, d2, d3]);
}

function map4(f, d1, d2, d3, d4)
{
	return mapMany(f, [d1, d2, d3, d4]);
}

function map5(f, d1, d2, d3, d4, d5)
{
	return mapMany(f, [d1, d2, d3, d4, d5]);
}

function map6(f, d1, d2, d3, d4, d5, d6)
{
	return mapMany(f, [d1, d2, d3, d4, d5, d6]);
}

function map7(f, d1, d2, d3, d4, d5, d6, d7)
{
	return mapMany(f, [d1, d2, d3, d4, d5, d6, d7]);
}

function map8(f, d1, d2, d3, d4, d5, d6, d7, d8)
{
	return mapMany(f, [d1, d2, d3, d4, d5, d6, d7, d8]);
}


// DECODE HELPERS

function ok(value)
{
	return { tag: 'ok', value: value };
}

function badPrimitive(type, value)
{
	return { tag: 'primitive', type: type, value: value };
}

function badIndex(index, nestedProblems)
{
	return { tag: 'index', index: index, rest: nestedProblems };
}

function badField(field, nestedProblems)
{
	return { tag: 'field', field: field, rest: nestedProblems };
}

function badIndex(index, nestedProblems)
{
	return { tag: 'index', index: index, rest: nestedProblems };
}

function badOneOf(problems)
{
	return { tag: 'oneOf', problems: problems };
}

function bad(msg)
{
	return { tag: 'fail', msg: msg };
}

function badToString(problem)
{
	var context = '_';
	while (problem)
	{
		switch (problem.tag)
		{
			case 'primitive':
				return 'Expecting ' + problem.type
					+ (context === '_' ? '' : ' at ' + context)
					+ ' but instead got: ' + jsToString(problem.value);

			case 'index':
				context += '[' + problem.index + ']';
				problem = problem.rest;
				break;

			case 'field':
				context += '.' + problem.field;
				problem = problem.rest;
				break;

			case 'oneOf':
				var problems = problem.problems;
				for (var i = 0; i < problems.length; i++)
				{
					problems[i] = badToString(problems[i]);
				}
				return 'I ran into the following problems'
					+ (context === '_' ? '' : ' at ' + context)
					+ ':\n\n' + problems.join('\n');

			case 'fail':
				return 'I ran into a `fail` decoder'
					+ (context === '_' ? '' : ' at ' + context)
					+ ': ' + problem.msg;
		}
	}
}

function jsToString(value)
{
	return value === undefined
		? 'undefined'
		: JSON.stringify(value);
}


// DECODE

function runOnString(decoder, string)
{
	var json;
	try
	{
		json = JSON.parse(string);
	}
	catch (e)
	{
		return _elm_lang$core$Result$Err('Given an invalid JSON: ' + e.message);
	}
	return run(decoder, json);
}

function run(decoder, value)
{
	var result = runHelp(decoder, value);
	return (result.tag === 'ok')
		? _elm_lang$core$Result$Ok(result.value)
		: _elm_lang$core$Result$Err(badToString(result));
}

function runHelp(decoder, value)
{
	switch (decoder.tag)
	{
		case 'bool':
			return (typeof value === 'boolean')
				? ok(value)
				: badPrimitive('a Bool', value);

		case 'int':
			if (typeof value !== 'number') {
				return badPrimitive('an Int', value);
			}

			if (-2147483647 < value && value < 2147483647 && (value | 0) === value) {
				return ok(value);
			}

			if (isFinite(value) && !(value % 1)) {
				return ok(value);
			}

			return badPrimitive('an Int', value);

		case 'float':
			return (typeof value === 'number')
				? ok(value)
				: badPrimitive('a Float', value);

		case 'string':
			return (typeof value === 'string')
				? ok(value)
				: (value instanceof String)
					? ok(value + '')
					: badPrimitive('a String', value);

		case 'null':
			return (value === null)
				? ok(decoder.value)
				: badPrimitive('null', value);

		case 'value':
			return ok(value);

		case 'list':
			if (!(value instanceof Array))
			{
				return badPrimitive('a List', value);
			}

			var list = _elm_lang$core$Native_List.Nil;
			for (var i = value.length; i--; )
			{
				var result = runHelp(decoder.decoder, value[i]);
				if (result.tag !== 'ok')
				{
					return badIndex(i, result)
				}
				list = _elm_lang$core$Native_List.Cons(result.value, list);
			}
			return ok(list);

		case 'array':
			if (!(value instanceof Array))
			{
				return badPrimitive('an Array', value);
			}

			var len = value.length;
			var array = new Array(len);
			for (var i = len; i--; )
			{
				var result = runHelp(decoder.decoder, value[i]);
				if (result.tag !== 'ok')
				{
					return badIndex(i, result);
				}
				array[i] = result.value;
			}
			return ok(_elm_lang$core$Native_Array.fromJSArray(array));

		case 'maybe':
			var result = runHelp(decoder.decoder, value);
			return (result.tag === 'ok')
				? ok(_elm_lang$core$Maybe$Just(result.value))
				: ok(_elm_lang$core$Maybe$Nothing);

		case 'field':
			var field = decoder.field;
			if (typeof value !== 'object' || value === null || !(field in value))
			{
				return badPrimitive('an object with a field named `' + field + '`', value);
			}

			var result = runHelp(decoder.decoder, value[field]);
			return (result.tag === 'ok') ? result : badField(field, result);

		case 'index':
			var index = decoder.index;
			if (!(value instanceof Array))
			{
				return badPrimitive('an array', value);
			}
			if (index >= value.length)
			{
				return badPrimitive('a longer array. Need index ' + index + ' but there are only ' + value.length + ' entries', value);
			}

			var result = runHelp(decoder.decoder, value[index]);
			return (result.tag === 'ok') ? result : badIndex(index, result);

		case 'key-value':
			if (typeof value !== 'object' || value === null || value instanceof Array)
			{
				return badPrimitive('an object', value);
			}

			var keyValuePairs = _elm_lang$core$Native_List.Nil;
			for (var key in value)
			{
				var result = runHelp(decoder.decoder, value[key]);
				if (result.tag !== 'ok')
				{
					return badField(key, result);
				}
				var pair = _elm_lang$core$Native_Utils.Tuple2(key, result.value);
				keyValuePairs = _elm_lang$core$Native_List.Cons(pair, keyValuePairs);
			}
			return ok(keyValuePairs);

		case 'map-many':
			var answer = decoder.func;
			var decoders = decoder.decoders;
			for (var i = 0; i < decoders.length; i++)
			{
				var result = runHelp(decoders[i], value);
				if (result.tag !== 'ok')
				{
					return result;
				}
				answer = answer(result.value);
			}
			return ok(answer);

		case 'andThen':
			var result = runHelp(decoder.decoder, value);
			return (result.tag !== 'ok')
				? result
				: runHelp(decoder.callback(result.value), value);

		case 'oneOf':
			var errors = [];
			var temp = decoder.decoders;
			while (temp.ctor !== '[]')
			{
				var result = runHelp(temp._0, value);

				if (result.tag === 'ok')
				{
					return result;
				}

				errors.push(result);

				temp = temp._1;
			}
			return badOneOf(errors);

		case 'fail':
			return bad(decoder.msg);

		case 'succeed':
			return ok(decoder.msg);
	}
}


// EQUALITY

function equality(a, b)
{
	if (a === b)
	{
		return true;
	}

	if (a.tag !== b.tag)
	{
		return false;
	}

	switch (a.tag)
	{
		case 'succeed':
		case 'fail':
			return a.msg === b.msg;

		case 'bool':
		case 'int':
		case 'float':
		case 'string':
		case 'value':
			return true;

		case 'null':
			return a.value === b.value;

		case 'list':
		case 'array':
		case 'maybe':
		case 'key-value':
			return equality(a.decoder, b.decoder);

		case 'field':
			return a.field === b.field && equality(a.decoder, b.decoder);

		case 'index':
			return a.index === b.index && equality(a.decoder, b.decoder);

		case 'map-many':
			if (a.func !== b.func)
			{
				return false;
			}
			return listEquality(a.decoders, b.decoders);

		case 'andThen':
			return a.callback === b.callback && equality(a.decoder, b.decoder);

		case 'oneOf':
			return listEquality(a.decoders, b.decoders);
	}
}

function listEquality(aDecoders, bDecoders)
{
	var len = aDecoders.length;
	if (len !== bDecoders.length)
	{
		return false;
	}
	for (var i = 0; i < len; i++)
	{
		if (!equality(aDecoders[i], bDecoders[i]))
		{
			return false;
		}
	}
	return true;
}


// ENCODE

function encode(indentLevel, value)
{
	return JSON.stringify(value, null, indentLevel);
}

function identity(value)
{
	return value;
}

function encodeObject(keyValuePairs)
{
	var obj = {};
	while (keyValuePairs.ctor !== '[]')
	{
		var pair = keyValuePairs._0;
		obj[pair._0] = pair._1;
		keyValuePairs = keyValuePairs._1;
	}
	return obj;
}

return {
	encode: F2(encode),
	runOnString: F2(runOnString),
	run: F2(run),

	decodeNull: decodeNull,
	decodePrimitive: decodePrimitive,
	decodeContainer: F2(decodeContainer),

	decodeField: F2(decodeField),
	decodeIndex: F2(decodeIndex),

	map1: F2(map1),
	map2: F3(map2),
	map3: F4(map3),
	map4: F5(map4),
	map5: F6(map5),
	map6: F7(map6),
	map7: F8(map7),
	map8: F9(map8),
	decodeKeyValuePairs: decodeKeyValuePairs,

	andThen: F2(andThen),
	fail: fail,
	succeed: succeed,
	oneOf: oneOf,

	identity: identity,
	encodeNull: null,
	encodeArray: _elm_lang$core$Native_Array.toJSArray,
	encodeList: _elm_lang$core$Native_List.toArray,
	encodeObject: encodeObject,

	equality: equality
};

}();

var _elm_lang$core$Json_Encode$list = _elm_lang$core$Native_Json.encodeList;
var _elm_lang$core$Json_Encode$array = _elm_lang$core$Native_Json.encodeArray;
var _elm_lang$core$Json_Encode$object = _elm_lang$core$Native_Json.encodeObject;
var _elm_lang$core$Json_Encode$null = _elm_lang$core$Native_Json.encodeNull;
var _elm_lang$core$Json_Encode$bool = _elm_lang$core$Native_Json.identity;
var _elm_lang$core$Json_Encode$float = _elm_lang$core$Native_Json.identity;
var _elm_lang$core$Json_Encode$int = _elm_lang$core$Native_Json.identity;
var _elm_lang$core$Json_Encode$string = _elm_lang$core$Native_Json.identity;
var _elm_lang$core$Json_Encode$encode = _elm_lang$core$Native_Json.encode;
var _elm_lang$core$Json_Encode$Value = {ctor: 'Value'};

var _elm_lang$core$Json_Decode$null = _elm_lang$core$Native_Json.decodeNull;
var _elm_lang$core$Json_Decode$value = _elm_lang$core$Native_Json.decodePrimitive('value');
var _elm_lang$core$Json_Decode$andThen = _elm_lang$core$Native_Json.andThen;
var _elm_lang$core$Json_Decode$fail = _elm_lang$core$Native_Json.fail;
var _elm_lang$core$Json_Decode$succeed = _elm_lang$core$Native_Json.succeed;
var _elm_lang$core$Json_Decode$lazy = function (thunk) {
	return A2(
		_elm_lang$core$Json_Decode$andThen,
		thunk,
		_elm_lang$core$Json_Decode$succeed(
			{ctor: '_Tuple0'}));
};
var _elm_lang$core$Json_Decode$decodeValue = _elm_lang$core$Native_Json.run;
var _elm_lang$core$Json_Decode$decodeString = _elm_lang$core$Native_Json.runOnString;
var _elm_lang$core$Json_Decode$map8 = _elm_lang$core$Native_Json.map8;
var _elm_lang$core$Json_Decode$map7 = _elm_lang$core$Native_Json.map7;
var _elm_lang$core$Json_Decode$map6 = _elm_lang$core$Native_Json.map6;
var _elm_lang$core$Json_Decode$map5 = _elm_lang$core$Native_Json.map5;
var _elm_lang$core$Json_Decode$map4 = _elm_lang$core$Native_Json.map4;
var _elm_lang$core$Json_Decode$map3 = _elm_lang$core$Native_Json.map3;
var _elm_lang$core$Json_Decode$map2 = _elm_lang$core$Native_Json.map2;
var _elm_lang$core$Json_Decode$map = _elm_lang$core$Native_Json.map1;
var _elm_lang$core$Json_Decode$oneOf = _elm_lang$core$Native_Json.oneOf;
var _elm_lang$core$Json_Decode$maybe = function (decoder) {
	return A2(_elm_lang$core$Native_Json.decodeContainer, 'maybe', decoder);
};
var _elm_lang$core$Json_Decode$index = _elm_lang$core$Native_Json.decodeIndex;
var _elm_lang$core$Json_Decode$field = _elm_lang$core$Native_Json.decodeField;
var _elm_lang$core$Json_Decode$at = F2(
	function (fields, decoder) {
		return A3(_elm_lang$core$List$foldr, _elm_lang$core$Json_Decode$field, decoder, fields);
	});
var _elm_lang$core$Json_Decode$keyValuePairs = _elm_lang$core$Native_Json.decodeKeyValuePairs;
var _elm_lang$core$Json_Decode$dict = function (decoder) {
	return A2(
		_elm_lang$core$Json_Decode$map,
		_elm_lang$core$Dict$fromList,
		_elm_lang$core$Json_Decode$keyValuePairs(decoder));
};
var _elm_lang$core$Json_Decode$array = function (decoder) {
	return A2(_elm_lang$core$Native_Json.decodeContainer, 'array', decoder);
};
var _elm_lang$core$Json_Decode$list = function (decoder) {
	return A2(_elm_lang$core$Native_Json.decodeContainer, 'list', decoder);
};
var _elm_lang$core$Json_Decode$nullable = function (decoder) {
	return _elm_lang$core$Json_Decode$oneOf(
		{
			ctor: '::',
			_0: _elm_lang$core$Json_Decode$null(_elm_lang$core$Maybe$Nothing),
			_1: {
				ctor: '::',
				_0: A2(_elm_lang$core$Json_Decode$map, _elm_lang$core$Maybe$Just, decoder),
				_1: {ctor: '[]'}
			}
		});
};
var _elm_lang$core$Json_Decode$float = _elm_lang$core$Native_Json.decodePrimitive('float');
var _elm_lang$core$Json_Decode$int = _elm_lang$core$Native_Json.decodePrimitive('int');
var _elm_lang$core$Json_Decode$bool = _elm_lang$core$Native_Json.decodePrimitive('bool');
var _elm_lang$core$Json_Decode$string = _elm_lang$core$Native_Json.decodePrimitive('string');
var _elm_lang$core$Json_Decode$Decoder = {ctor: 'Decoder'};

var _elm_lang$core$Process$kill = _elm_lang$core$Native_Scheduler.kill;
var _elm_lang$core$Process$sleep = _elm_lang$core$Native_Scheduler.sleep;
var _elm_lang$core$Process$spawn = _elm_lang$core$Native_Scheduler.spawn;

var _elm_lang$core$Tuple$mapSecond = F2(
	function (func, _p0) {
		var _p1 = _p0;
		return {
			ctor: '_Tuple2',
			_0: _p1._0,
			_1: func(_p1._1)
		};
	});
var _elm_lang$core$Tuple$mapFirst = F2(
	function (func, _p2) {
		var _p3 = _p2;
		return {
			ctor: '_Tuple2',
			_0: func(_p3._0),
			_1: _p3._1
		};
	});
var _elm_lang$core$Tuple$second = function (_p4) {
	var _p5 = _p4;
	return _p5._1;
};
var _elm_lang$core$Tuple$first = function (_p6) {
	var _p7 = _p6;
	return _p7._0;
};

var _elm_lang$virtual_dom$VirtualDom_Debug$wrap;
var _elm_lang$virtual_dom$VirtualDom_Debug$wrapWithFlags;

var _elm_lang$virtual_dom$Native_VirtualDom = function() {

var STYLE_KEY = 'STYLE';
var EVENT_KEY = 'EVENT';
var ATTR_KEY = 'ATTR';
var ATTR_NS_KEY = 'ATTR_NS';

var localDoc = typeof document !== 'undefined' ? document : {};


////////////  VIRTUAL DOM NODES  ////////////


function text(string)
{
	return {
		type: 'text',
		text: string
	};
}


function node(tag)
{
	return F2(function(factList, kidList) {
		return nodeHelp(tag, factList, kidList);
	});
}


function nodeHelp(tag, factList, kidList)
{
	var organized = organizeFacts(factList);
	var namespace = organized.namespace;
	var facts = organized.facts;

	var children = [];
	var descendantsCount = 0;
	while (kidList.ctor !== '[]')
	{
		var kid = kidList._0;
		descendantsCount += (kid.descendantsCount || 0);
		children.push(kid);
		kidList = kidList._1;
	}
	descendantsCount += children.length;

	return {
		type: 'node',
		tag: tag,
		facts: facts,
		children: children,
		namespace: namespace,
		descendantsCount: descendantsCount
	};
}


function keyedNode(tag, factList, kidList)
{
	var organized = organizeFacts(factList);
	var namespace = organized.namespace;
	var facts = organized.facts;

	var children = [];
	var descendantsCount = 0;
	while (kidList.ctor !== '[]')
	{
		var kid = kidList._0;
		descendantsCount += (kid._1.descendantsCount || 0);
		children.push(kid);
		kidList = kidList._1;
	}
	descendantsCount += children.length;

	return {
		type: 'keyed-node',
		tag: tag,
		facts: facts,
		children: children,
		namespace: namespace,
		descendantsCount: descendantsCount
	};
}


function custom(factList, model, impl)
{
	var facts = organizeFacts(factList).facts;

	return {
		type: 'custom',
		facts: facts,
		model: model,
		impl: impl
	};
}


function map(tagger, node)
{
	return {
		type: 'tagger',
		tagger: tagger,
		node: node,
		descendantsCount: 1 + (node.descendantsCount || 0)
	};
}


function thunk(func, args, thunk)
{
	return {
		type: 'thunk',
		func: func,
		args: args,
		thunk: thunk,
		node: undefined
	};
}

function lazy(fn, a)
{
	return thunk(fn, [a], function() {
		return fn(a);
	});
}

function lazy2(fn, a, b)
{
	return thunk(fn, [a,b], function() {
		return A2(fn, a, b);
	});
}

function lazy3(fn, a, b, c)
{
	return thunk(fn, [a,b,c], function() {
		return A3(fn, a, b, c);
	});
}



// FACTS


function organizeFacts(factList)
{
	var namespace, facts = {};

	while (factList.ctor !== '[]')
	{
		var entry = factList._0;
		var key = entry.key;

		if (key === ATTR_KEY || key === ATTR_NS_KEY || key === EVENT_KEY)
		{
			var subFacts = facts[key] || {};
			subFacts[entry.realKey] = entry.value;
			facts[key] = subFacts;
		}
		else if (key === STYLE_KEY)
		{
			var styles = facts[key] || {};
			var styleList = entry.value;
			while (styleList.ctor !== '[]')
			{
				var style = styleList._0;
				styles[style._0] = style._1;
				styleList = styleList._1;
			}
			facts[key] = styles;
		}
		else if (key === 'namespace')
		{
			namespace = entry.value;
		}
		else if (key === 'className')
		{
			var classes = facts[key];
			facts[key] = typeof classes === 'undefined'
				? entry.value
				: classes + ' ' + entry.value;
		}
 		else
		{
			facts[key] = entry.value;
		}
		factList = factList._1;
	}

	return {
		facts: facts,
		namespace: namespace
	};
}



////////////  PROPERTIES AND ATTRIBUTES  ////////////


function style(value)
{
	return {
		key: STYLE_KEY,
		value: value
	};
}


function property(key, value)
{
	return {
		key: key,
		value: value
	};
}


function attribute(key, value)
{
	return {
		key: ATTR_KEY,
		realKey: key,
		value: value
	};
}


function attributeNS(namespace, key, value)
{
	return {
		key: ATTR_NS_KEY,
		realKey: key,
		value: {
			value: value,
			namespace: namespace
		}
	};
}


function on(name, options, decoder)
{
	return {
		key: EVENT_KEY,
		realKey: name,
		value: {
			options: options,
			decoder: decoder
		}
	};
}


function equalEvents(a, b)
{
	if (a.options !== b.options)
	{
		if (a.options.stopPropagation !== b.options.stopPropagation || a.options.preventDefault !== b.options.preventDefault)
		{
			return false;
		}
	}
	return _elm_lang$core$Native_Json.equality(a.decoder, b.decoder);
}


function mapProperty(func, property)
{
	if (property.key !== EVENT_KEY)
	{
		return property;
	}
	return on(
		property.realKey,
		property.value.options,
		A2(_elm_lang$core$Json_Decode$map, func, property.value.decoder)
	);
}


////////////  RENDER  ////////////


function render(vNode, eventNode)
{
	switch (vNode.type)
	{
		case 'thunk':
			if (!vNode.node)
			{
				vNode.node = vNode.thunk();
			}
			return render(vNode.node, eventNode);

		case 'tagger':
			var subNode = vNode.node;
			var tagger = vNode.tagger;

			while (subNode.type === 'tagger')
			{
				typeof tagger !== 'object'
					? tagger = [tagger, subNode.tagger]
					: tagger.push(subNode.tagger);

				subNode = subNode.node;
			}

			var subEventRoot = { tagger: tagger, parent: eventNode };
			var domNode = render(subNode, subEventRoot);
			domNode.elm_event_node_ref = subEventRoot;
			return domNode;

		case 'text':
			return localDoc.createTextNode(vNode.text);

		case 'node':
			var domNode = vNode.namespace
				? localDoc.createElementNS(vNode.namespace, vNode.tag)
				: localDoc.createElement(vNode.tag);

			applyFacts(domNode, eventNode, vNode.facts);

			var children = vNode.children;

			for (var i = 0; i < children.length; i++)
			{
				domNode.appendChild(render(children[i], eventNode));
			}

			return domNode;

		case 'keyed-node':
			var domNode = vNode.namespace
				? localDoc.createElementNS(vNode.namespace, vNode.tag)
				: localDoc.createElement(vNode.tag);

			applyFacts(domNode, eventNode, vNode.facts);

			var children = vNode.children;

			for (var i = 0; i < children.length; i++)
			{
				domNode.appendChild(render(children[i]._1, eventNode));
			}

			return domNode;

		case 'custom':
			var domNode = vNode.impl.render(vNode.model);
			applyFacts(domNode, eventNode, vNode.facts);
			return domNode;
	}
}



////////////  APPLY FACTS  ////////////


function applyFacts(domNode, eventNode, facts)
{
	for (var key in facts)
	{
		var value = facts[key];

		switch (key)
		{
			case STYLE_KEY:
				applyStyles(domNode, value);
				break;

			case EVENT_KEY:
				applyEvents(domNode, eventNode, value);
				break;

			case ATTR_KEY:
				applyAttrs(domNode, value);
				break;

			case ATTR_NS_KEY:
				applyAttrsNS(domNode, value);
				break;

			case 'value':
				if (domNode[key] !== value)
				{
					domNode[key] = value;
				}
				break;

			default:
				domNode[key] = value;
				break;
		}
	}
}

function applyStyles(domNode, styles)
{
	var domNodeStyle = domNode.style;

	for (var key in styles)
	{
		domNodeStyle[key] = styles[key];
	}
}

function applyEvents(domNode, eventNode, events)
{
	var allHandlers = domNode.elm_handlers || {};

	for (var key in events)
	{
		var handler = allHandlers[key];
		var value = events[key];

		if (typeof value === 'undefined')
		{
			domNode.removeEventListener(key, handler);
			allHandlers[key] = undefined;
		}
		else if (typeof handler === 'undefined')
		{
			var handler = makeEventHandler(eventNode, value);
			domNode.addEventListener(key, handler);
			allHandlers[key] = handler;
		}
		else
		{
			handler.info = value;
		}
	}

	domNode.elm_handlers = allHandlers;
}

function makeEventHandler(eventNode, info)
{
	function eventHandler(event)
	{
		var info = eventHandler.info;

		var value = A2(_elm_lang$core$Native_Json.run, info.decoder, event);

		if (value.ctor === 'Ok')
		{
			var options = info.options;
			if (options.stopPropagation)
			{
				event.stopPropagation();
			}
			if (options.preventDefault)
			{
				event.preventDefault();
			}

			var message = value._0;

			var currentEventNode = eventNode;
			while (currentEventNode)
			{
				var tagger = currentEventNode.tagger;
				if (typeof tagger === 'function')
				{
					message = tagger(message);
				}
				else
				{
					for (var i = tagger.length; i--; )
					{
						message = tagger[i](message);
					}
				}
				currentEventNode = currentEventNode.parent;
			}
		}
	};

	eventHandler.info = info;

	return eventHandler;
}

function applyAttrs(domNode, attrs)
{
	for (var key in attrs)
	{
		var value = attrs[key];
		if (typeof value === 'undefined')
		{
			domNode.removeAttribute(key);
		}
		else
		{
			domNode.setAttribute(key, value);
		}
	}
}

function applyAttrsNS(domNode, nsAttrs)
{
	for (var key in nsAttrs)
	{
		var pair = nsAttrs[key];
		var namespace = pair.namespace;
		var value = pair.value;

		if (typeof value === 'undefined')
		{
			domNode.removeAttributeNS(namespace, key);
		}
		else
		{
			domNode.setAttributeNS(namespace, key, value);
		}
	}
}



////////////  DIFF  ////////////


function diff(a, b)
{
	var patches = [];
	diffHelp(a, b, patches, 0);
	return patches;
}


function makePatch(type, index, data)
{
	return {
		index: index,
		type: type,
		data: data,
		domNode: undefined,
		eventNode: undefined
	};
}


function diffHelp(a, b, patches, index)
{
	if (a === b)
	{
		return;
	}

	var aType = a.type;
	var bType = b.type;

	// Bail if you run into different types of nodes. Implies that the
	// structure has changed significantly and it's not worth a diff.
	if (aType !== bType)
	{
		patches.push(makePatch('p-redraw', index, b));
		return;
	}

	// Now we know that both nodes are the same type.
	switch (bType)
	{
		case 'thunk':
			var aArgs = a.args;
			var bArgs = b.args;
			var i = aArgs.length;
			var same = a.func === b.func && i === bArgs.length;
			while (same && i--)
			{
				same = aArgs[i] === bArgs[i];
			}
			if (same)
			{
				b.node = a.node;
				return;
			}
			b.node = b.thunk();
			var subPatches = [];
			diffHelp(a.node, b.node, subPatches, 0);
			if (subPatches.length > 0)
			{
				patches.push(makePatch('p-thunk', index, subPatches));
			}
			return;

		case 'tagger':
			// gather nested taggers
			var aTaggers = a.tagger;
			var bTaggers = b.tagger;
			var nesting = false;

			var aSubNode = a.node;
			while (aSubNode.type === 'tagger')
			{
				nesting = true;

				typeof aTaggers !== 'object'
					? aTaggers = [aTaggers, aSubNode.tagger]
					: aTaggers.push(aSubNode.tagger);

				aSubNode = aSubNode.node;
			}

			var bSubNode = b.node;
			while (bSubNode.type === 'tagger')
			{
				nesting = true;

				typeof bTaggers !== 'object'
					? bTaggers = [bTaggers, bSubNode.tagger]
					: bTaggers.push(bSubNode.tagger);

				bSubNode = bSubNode.node;
			}

			// Just bail if different numbers of taggers. This implies the
			// structure of the virtual DOM has changed.
			if (nesting && aTaggers.length !== bTaggers.length)
			{
				patches.push(makePatch('p-redraw', index, b));
				return;
			}

			// check if taggers are "the same"
			if (nesting ? !pairwiseRefEqual(aTaggers, bTaggers) : aTaggers !== bTaggers)
			{
				patches.push(makePatch('p-tagger', index, bTaggers));
			}

			// diff everything below the taggers
			diffHelp(aSubNode, bSubNode, patches, index + 1);
			return;

		case 'text':
			if (a.text !== b.text)
			{
				patches.push(makePatch('p-text', index, b.text));
				return;
			}

			return;

		case 'node':
			// Bail if obvious indicators have changed. Implies more serious
			// structural changes such that it's not worth it to diff.
			if (a.tag !== b.tag || a.namespace !== b.namespace)
			{
				patches.push(makePatch('p-redraw', index, b));
				return;
			}

			var factsDiff = diffFacts(a.facts, b.facts);

			if (typeof factsDiff !== 'undefined')
			{
				patches.push(makePatch('p-facts', index, factsDiff));
			}

			diffChildren(a, b, patches, index);
			return;

		case 'keyed-node':
			// Bail if obvious indicators have changed. Implies more serious
			// structural changes such that it's not worth it to diff.
			if (a.tag !== b.tag || a.namespace !== b.namespace)
			{
				patches.push(makePatch('p-redraw', index, b));
				return;
			}

			var factsDiff = diffFacts(a.facts, b.facts);

			if (typeof factsDiff !== 'undefined')
			{
				patches.push(makePatch('p-facts', index, factsDiff));
			}

			diffKeyedChildren(a, b, patches, index);
			return;

		case 'custom':
			if (a.impl !== b.impl)
			{
				patches.push(makePatch('p-redraw', index, b));
				return;
			}

			var factsDiff = diffFacts(a.facts, b.facts);
			if (typeof factsDiff !== 'undefined')
			{
				patches.push(makePatch('p-facts', index, factsDiff));
			}

			var patch = b.impl.diff(a,b);
			if (patch)
			{
				patches.push(makePatch('p-custom', index, patch));
				return;
			}

			return;
	}
}


// assumes the incoming arrays are the same length
function pairwiseRefEqual(as, bs)
{
	for (var i = 0; i < as.length; i++)
	{
		if (as[i] !== bs[i])
		{
			return false;
		}
	}

	return true;
}


// TODO Instead of creating a new diff object, it's possible to just test if
// there *is* a diff. During the actual patch, do the diff again and make the
// modifications directly. This way, there's no new allocations. Worth it?
function diffFacts(a, b, category)
{
	var diff;

	// look for changes and removals
	for (var aKey in a)
	{
		if (aKey === STYLE_KEY || aKey === EVENT_KEY || aKey === ATTR_KEY || aKey === ATTR_NS_KEY)
		{
			var subDiff = diffFacts(a[aKey], b[aKey] || {}, aKey);
			if (subDiff)
			{
				diff = diff || {};
				diff[aKey] = subDiff;
			}
			continue;
		}

		// remove if not in the new facts
		if (!(aKey in b))
		{
			diff = diff || {};
			diff[aKey] =
				(typeof category === 'undefined')
					? (typeof a[aKey] === 'string' ? '' : null)
					:
				(category === STYLE_KEY)
					? ''
					:
				(category === EVENT_KEY || category === ATTR_KEY)
					? undefined
					:
				{ namespace: a[aKey].namespace, value: undefined };

			continue;
		}

		var aValue = a[aKey];
		var bValue = b[aKey];

		// reference equal, so don't worry about it
		if (aValue === bValue && aKey !== 'value'
			|| category === EVENT_KEY && equalEvents(aValue, bValue))
		{
			continue;
		}

		diff = diff || {};
		diff[aKey] = bValue;
	}

	// add new stuff
	for (var bKey in b)
	{
		if (!(bKey in a))
		{
			diff = diff || {};
			diff[bKey] = b[bKey];
		}
	}

	return diff;
}


function diffChildren(aParent, bParent, patches, rootIndex)
{
	var aChildren = aParent.children;
	var bChildren = bParent.children;

	var aLen = aChildren.length;
	var bLen = bChildren.length;

	// FIGURE OUT IF THERE ARE INSERTS OR REMOVALS

	if (aLen > bLen)
	{
		patches.push(makePatch('p-remove-last', rootIndex, aLen - bLen));
	}
	else if (aLen < bLen)
	{
		patches.push(makePatch('p-append', rootIndex, bChildren.slice(aLen)));
	}

	// PAIRWISE DIFF EVERYTHING ELSE

	var index = rootIndex;
	var minLen = aLen < bLen ? aLen : bLen;
	for (var i = 0; i < minLen; i++)
	{
		index++;
		var aChild = aChildren[i];
		diffHelp(aChild, bChildren[i], patches, index);
		index += aChild.descendantsCount || 0;
	}
}



////////////  KEYED DIFF  ////////////


function diffKeyedChildren(aParent, bParent, patches, rootIndex)
{
	var localPatches = [];

	var changes = {}; // Dict String Entry
	var inserts = []; // Array { index : Int, entry : Entry }
	// type Entry = { tag : String, vnode : VNode, index : Int, data : _ }

	var aChildren = aParent.children;
	var bChildren = bParent.children;
	var aLen = aChildren.length;
	var bLen = bChildren.length;
	var aIndex = 0;
	var bIndex = 0;

	var index = rootIndex;

	while (aIndex < aLen && bIndex < bLen)
	{
		var a = aChildren[aIndex];
		var b = bChildren[bIndex];

		var aKey = a._0;
		var bKey = b._0;
		var aNode = a._1;
		var bNode = b._1;

		// check if keys match

		if (aKey === bKey)
		{
			index++;
			diffHelp(aNode, bNode, localPatches, index);
			index += aNode.descendantsCount || 0;

			aIndex++;
			bIndex++;
			continue;
		}

		// look ahead 1 to detect insertions and removals.

		var aLookAhead = aIndex + 1 < aLen;
		var bLookAhead = bIndex + 1 < bLen;

		if (aLookAhead)
		{
			var aNext = aChildren[aIndex + 1];
			var aNextKey = aNext._0;
			var aNextNode = aNext._1;
			var oldMatch = bKey === aNextKey;
		}

		if (bLookAhead)
		{
			var bNext = bChildren[bIndex + 1];
			var bNextKey = bNext._0;
			var bNextNode = bNext._1;
			var newMatch = aKey === bNextKey;
		}


		// swap a and b
		if (aLookAhead && bLookAhead && newMatch && oldMatch)
		{
			index++;
			diffHelp(aNode, bNextNode, localPatches, index);
			insertNode(changes, localPatches, aKey, bNode, bIndex, inserts);
			index += aNode.descendantsCount || 0;

			index++;
			removeNode(changes, localPatches, aKey, aNextNode, index);
			index += aNextNode.descendantsCount || 0;

			aIndex += 2;
			bIndex += 2;
			continue;
		}

		// insert b
		if (bLookAhead && newMatch)
		{
			index++;
			insertNode(changes, localPatches, bKey, bNode, bIndex, inserts);
			diffHelp(aNode, bNextNode, localPatches, index);
			index += aNode.descendantsCount || 0;

			aIndex += 1;
			bIndex += 2;
			continue;
		}

		// remove a
		if (aLookAhead && oldMatch)
		{
			index++;
			removeNode(changes, localPatches, aKey, aNode, index);
			index += aNode.descendantsCount || 0;

			index++;
			diffHelp(aNextNode, bNode, localPatches, index);
			index += aNextNode.descendantsCount || 0;

			aIndex += 2;
			bIndex += 1;
			continue;
		}

		// remove a, insert b
		if (aLookAhead && bLookAhead && aNextKey === bNextKey)
		{
			index++;
			removeNode(changes, localPatches, aKey, aNode, index);
			insertNode(changes, localPatches, bKey, bNode, bIndex, inserts);
			index += aNode.descendantsCount || 0;

			index++;
			diffHelp(aNextNode, bNextNode, localPatches, index);
			index += aNextNode.descendantsCount || 0;

			aIndex += 2;
			bIndex += 2;
			continue;
		}

		break;
	}

	// eat up any remaining nodes with removeNode and insertNode

	while (aIndex < aLen)
	{
		index++;
		var a = aChildren[aIndex];
		var aNode = a._1;
		removeNode(changes, localPatches, a._0, aNode, index);
		index += aNode.descendantsCount || 0;
		aIndex++;
	}

	var endInserts;
	while (bIndex < bLen)
	{
		endInserts = endInserts || [];
		var b = bChildren[bIndex];
		insertNode(changes, localPatches, b._0, b._1, undefined, endInserts);
		bIndex++;
	}

	if (localPatches.length > 0 || inserts.length > 0 || typeof endInserts !== 'undefined')
	{
		patches.push(makePatch('p-reorder', rootIndex, {
			patches: localPatches,
			inserts: inserts,
			endInserts: endInserts
		}));
	}
}



////////////  CHANGES FROM KEYED DIFF  ////////////


var POSTFIX = '_elmW6BL';


function insertNode(changes, localPatches, key, vnode, bIndex, inserts)
{
	var entry = changes[key];

	// never seen this key before
	if (typeof entry === 'undefined')
	{
		entry = {
			tag: 'insert',
			vnode: vnode,
			index: bIndex,
			data: undefined
		};

		inserts.push({ index: bIndex, entry: entry });
		changes[key] = entry;

		return;
	}

	// this key was removed earlier, a match!
	if (entry.tag === 'remove')
	{
		inserts.push({ index: bIndex, entry: entry });

		entry.tag = 'move';
		var subPatches = [];
		diffHelp(entry.vnode, vnode, subPatches, entry.index);
		entry.index = bIndex;
		entry.data.data = {
			patches: subPatches,
			entry: entry
		};

		return;
	}

	// this key has already been inserted or moved, a duplicate!
	insertNode(changes, localPatches, key + POSTFIX, vnode, bIndex, inserts);
}


function removeNode(changes, localPatches, key, vnode, index)
{
	var entry = changes[key];

	// never seen this key before
	if (typeof entry === 'undefined')
	{
		var patch = makePatch('p-remove', index, undefined);
		localPatches.push(patch);

		changes[key] = {
			tag: 'remove',
			vnode: vnode,
			index: index,
			data: patch
		};

		return;
	}

	// this key was inserted earlier, a match!
	if (entry.tag === 'insert')
	{
		entry.tag = 'move';
		var subPatches = [];
		diffHelp(vnode, entry.vnode, subPatches, index);

		var patch = makePatch('p-remove', index, {
			patches: subPatches,
			entry: entry
		});
		localPatches.push(patch);

		return;
	}

	// this key has already been removed or moved, a duplicate!
	removeNode(changes, localPatches, key + POSTFIX, vnode, index);
}



////////////  ADD DOM NODES  ////////////
//
// Each DOM node has an "index" assigned in order of traversal. It is important
// to minimize our crawl over the actual DOM, so these indexes (along with the
// descendantsCount of virtual nodes) let us skip touching entire subtrees of
// the DOM if we know there are no patches there.


function addDomNodes(domNode, vNode, patches, eventNode)
{
	addDomNodesHelp(domNode, vNode, patches, 0, 0, vNode.descendantsCount, eventNode);
}


// assumes `patches` is non-empty and indexes increase monotonically.
function addDomNodesHelp(domNode, vNode, patches, i, low, high, eventNode)
{
	var patch = patches[i];
	var index = patch.index;

	while (index === low)
	{
		var patchType = patch.type;

		if (patchType === 'p-thunk')
		{
			addDomNodes(domNode, vNode.node, patch.data, eventNode);
		}
		else if (patchType === 'p-reorder')
		{
			patch.domNode = domNode;
			patch.eventNode = eventNode;

			var subPatches = patch.data.patches;
			if (subPatches.length > 0)
			{
				addDomNodesHelp(domNode, vNode, subPatches, 0, low, high, eventNode);
			}
		}
		else if (patchType === 'p-remove')
		{
			patch.domNode = domNode;
			patch.eventNode = eventNode;

			var data = patch.data;
			if (typeof data !== 'undefined')
			{
				data.entry.data = domNode;
				var subPatches = data.patches;
				if (subPatches.length > 0)
				{
					addDomNodesHelp(domNode, vNode, subPatches, 0, low, high, eventNode);
				}
			}
		}
		else
		{
			patch.domNode = domNode;
			patch.eventNode = eventNode;
		}

		i++;

		if (!(patch = patches[i]) || (index = patch.index) > high)
		{
			return i;
		}
	}

	switch (vNode.type)
	{
		case 'tagger':
			var subNode = vNode.node;

			while (subNode.type === "tagger")
			{
				subNode = subNode.node;
			}

			return addDomNodesHelp(domNode, subNode, patches, i, low + 1, high, domNode.elm_event_node_ref);

		case 'node':
			var vChildren = vNode.children;
			var childNodes = domNode.childNodes;
			for (var j = 0; j < vChildren.length; j++)
			{
				low++;
				var vChild = vChildren[j];
				var nextLow = low + (vChild.descendantsCount || 0);
				if (low <= index && index <= nextLow)
				{
					i = addDomNodesHelp(childNodes[j], vChild, patches, i, low, nextLow, eventNode);
					if (!(patch = patches[i]) || (index = patch.index) > high)
					{
						return i;
					}
				}
				low = nextLow;
			}
			return i;

		case 'keyed-node':
			var vChildren = vNode.children;
			var childNodes = domNode.childNodes;
			for (var j = 0; j < vChildren.length; j++)
			{
				low++;
				var vChild = vChildren[j]._1;
				var nextLow = low + (vChild.descendantsCount || 0);
				if (low <= index && index <= nextLow)
				{
					i = addDomNodesHelp(childNodes[j], vChild, patches, i, low, nextLow, eventNode);
					if (!(patch = patches[i]) || (index = patch.index) > high)
					{
						return i;
					}
				}
				low = nextLow;
			}
			return i;

		case 'text':
		case 'thunk':
			throw new Error('should never traverse `text` or `thunk` nodes like this');
	}
}



////////////  APPLY PATCHES  ////////////


function applyPatches(rootDomNode, oldVirtualNode, patches, eventNode)
{
	if (patches.length === 0)
	{
		return rootDomNode;
	}

	addDomNodes(rootDomNode, oldVirtualNode, patches, eventNode);
	return applyPatchesHelp(rootDomNode, patches);
}

function applyPatchesHelp(rootDomNode, patches)
{
	for (var i = 0; i < patches.length; i++)
	{
		var patch = patches[i];
		var localDomNode = patch.domNode
		var newNode = applyPatch(localDomNode, patch);
		if (localDomNode === rootDomNode)
		{
			rootDomNode = newNode;
		}
	}
	return rootDomNode;
}

function applyPatch(domNode, patch)
{
	switch (patch.type)
	{
		case 'p-redraw':
			return applyPatchRedraw(domNode, patch.data, patch.eventNode);

		case 'p-facts':
			applyFacts(domNode, patch.eventNode, patch.data);
			return domNode;

		case 'p-text':
			domNode.replaceData(0, domNode.length, patch.data);
			return domNode;

		case 'p-thunk':
			return applyPatchesHelp(domNode, patch.data);

		case 'p-tagger':
			if (typeof domNode.elm_event_node_ref !== 'undefined')
			{
				domNode.elm_event_node_ref.tagger = patch.data;
			}
			else
			{
				domNode.elm_event_node_ref = { tagger: patch.data, parent: patch.eventNode };
			}
			return domNode;

		case 'p-remove-last':
			var i = patch.data;
			while (i--)
			{
				domNode.removeChild(domNode.lastChild);
			}
			return domNode;

		case 'p-append':
			var newNodes = patch.data;
			for (var i = 0; i < newNodes.length; i++)
			{
				domNode.appendChild(render(newNodes[i], patch.eventNode));
			}
			return domNode;

		case 'p-remove':
			var data = patch.data;
			if (typeof data === 'undefined')
			{
				domNode.parentNode.removeChild(domNode);
				return domNode;
			}
			var entry = data.entry;
			if (typeof entry.index !== 'undefined')
			{
				domNode.parentNode.removeChild(domNode);
			}
			entry.data = applyPatchesHelp(domNode, data.patches);
			return domNode;

		case 'p-reorder':
			return applyPatchReorder(domNode, patch);

		case 'p-custom':
			var impl = patch.data;
			return impl.applyPatch(domNode, impl.data);

		default:
			throw new Error('Ran into an unknown patch!');
	}
}


function applyPatchRedraw(domNode, vNode, eventNode)
{
	var parentNode = domNode.parentNode;
	var newNode = render(vNode, eventNode);

	if (typeof newNode.elm_event_node_ref === 'undefined')
	{
		newNode.elm_event_node_ref = domNode.elm_event_node_ref;
	}

	if (parentNode && newNode !== domNode)
	{
		parentNode.replaceChild(newNode, domNode);
	}
	return newNode;
}


function applyPatchReorder(domNode, patch)
{
	var data = patch.data;

	// remove end inserts
	var frag = applyPatchReorderEndInsertsHelp(data.endInserts, patch);

	// removals
	domNode = applyPatchesHelp(domNode, data.patches);

	// inserts
	var inserts = data.inserts;
	for (var i = 0; i < inserts.length; i++)
	{
		var insert = inserts[i];
		var entry = insert.entry;
		var node = entry.tag === 'move'
			? entry.data
			: render(entry.vnode, patch.eventNode);
		domNode.insertBefore(node, domNode.childNodes[insert.index]);
	}

	// add end inserts
	if (typeof frag !== 'undefined')
	{
		domNode.appendChild(frag);
	}

	return domNode;
}


function applyPatchReorderEndInsertsHelp(endInserts, patch)
{
	if (typeof endInserts === 'undefined')
	{
		return;
	}

	var frag = localDoc.createDocumentFragment();
	for (var i = 0; i < endInserts.length; i++)
	{
		var insert = endInserts[i];
		var entry = insert.entry;
		frag.appendChild(entry.tag === 'move'
			? entry.data
			: render(entry.vnode, patch.eventNode)
		);
	}
	return frag;
}


// PROGRAMS

var program = makeProgram(checkNoFlags);
var programWithFlags = makeProgram(checkYesFlags);

function makeProgram(flagChecker)
{
	return F2(function(debugWrap, impl)
	{
		return function(flagDecoder)
		{
			return function(object, moduleName, debugMetadata)
			{
				var checker = flagChecker(flagDecoder, moduleName);
				if (typeof debugMetadata === 'undefined')
				{
					normalSetup(impl, object, moduleName, checker);
				}
				else
				{
					debugSetup(A2(debugWrap, debugMetadata, impl), object, moduleName, checker);
				}
			};
		};
	});
}

function staticProgram(vNode)
{
	var nothing = _elm_lang$core$Native_Utils.Tuple2(
		_elm_lang$core$Native_Utils.Tuple0,
		_elm_lang$core$Platform_Cmd$none
	);
	return A2(program, _elm_lang$virtual_dom$VirtualDom_Debug$wrap, {
		init: nothing,
		view: function() { return vNode; },
		update: F2(function() { return nothing; }),
		subscriptions: function() { return _elm_lang$core$Platform_Sub$none; }
	})();
}


// FLAG CHECKERS

function checkNoFlags(flagDecoder, moduleName)
{
	return function(init, flags, domNode)
	{
		if (typeof flags === 'undefined')
		{
			return init;
		}

		var errorMessage =
			'The `' + moduleName + '` module does not need flags.\n'
			+ 'Initialize it with no arguments and you should be all set!';

		crash(errorMessage, domNode);
	};
}

function checkYesFlags(flagDecoder, moduleName)
{
	return function(init, flags, domNode)
	{
		if (typeof flagDecoder === 'undefined')
		{
			var errorMessage =
				'Are you trying to sneak a Never value into Elm? Trickster!\n'
				+ 'It looks like ' + moduleName + '.main is defined with `programWithFlags` but has type `Program Never`.\n'
				+ 'Use `program` instead if you do not want flags.'

			crash(errorMessage, domNode);
		}

		var result = A2(_elm_lang$core$Native_Json.run, flagDecoder, flags);
		if (result.ctor === 'Ok')
		{
			return init(result._0);
		}

		var errorMessage =
			'Trying to initialize the `' + moduleName + '` module with an unexpected flag.\n'
			+ 'I tried to convert it to an Elm value, but ran into this problem:\n\n'
			+ result._0;

		crash(errorMessage, domNode);
	};
}

function crash(errorMessage, domNode)
{
	if (domNode)
	{
		domNode.innerHTML =
			'<div style="padding-left:1em;">'
			+ '<h2 style="font-weight:normal;"><b>Oops!</b> Something went wrong when starting your Elm program.</h2>'
			+ '<pre style="padding-left:1em;">' + errorMessage + '</pre>'
			+ '</div>';
	}

	throw new Error(errorMessage);
}


//  NORMAL SETUP

function normalSetup(impl, object, moduleName, flagChecker)
{
	object['embed'] = function embed(node, flags)
	{
		while (node.lastChild)
		{
			node.removeChild(node.lastChild);
		}

		return _elm_lang$core$Native_Platform.initialize(
			flagChecker(impl.init, flags, node),
			impl.update,
			impl.subscriptions,
			normalRenderer(node, impl.view)
		);
	};

	object['fullscreen'] = function fullscreen(flags)
	{
		return _elm_lang$core$Native_Platform.initialize(
			flagChecker(impl.init, flags, document.body),
			impl.update,
			impl.subscriptions,
			normalRenderer(document.body, impl.view)
		);
	};
}

function normalRenderer(parentNode, view)
{
	return function(tagger, initialModel)
	{
		var eventNode = { tagger: tagger, parent: undefined };
		var initialVirtualNode = view(initialModel);
		var domNode = render(initialVirtualNode, eventNode);
		parentNode.appendChild(domNode);
		return makeStepper(domNode, view, initialVirtualNode, eventNode);
	};
}


// STEPPER

var rAF =
	typeof requestAnimationFrame !== 'undefined'
		? requestAnimationFrame
		: function(callback) { setTimeout(callback, 1000 / 60); };

function makeStepper(domNode, view, initialVirtualNode, eventNode)
{
	var state = 'NO_REQUEST';
	var currNode = initialVirtualNode;
	var nextModel;

	function updateIfNeeded()
	{
		switch (state)
		{
			case 'NO_REQUEST':
				throw new Error(
					'Unexpected draw callback.\n' +
					'Please report this to <https://github.com/elm-lang/virtual-dom/issues>.'
				);

			case 'PENDING_REQUEST':
				rAF(updateIfNeeded);
				state = 'EXTRA_REQUEST';

				var nextNode = view(nextModel);
				var patches = diff(currNode, nextNode);
				domNode = applyPatches(domNode, currNode, patches, eventNode);
				currNode = nextNode;

				return;

			case 'EXTRA_REQUEST':
				state = 'NO_REQUEST';
				return;
		}
	}

	return function stepper(model)
	{
		if (state === 'NO_REQUEST')
		{
			rAF(updateIfNeeded);
		}
		state = 'PENDING_REQUEST';
		nextModel = model;
	};
}


// DEBUG SETUP

function debugSetup(impl, object, moduleName, flagChecker)
{
	object['fullscreen'] = function fullscreen(flags)
	{
		var popoutRef = { doc: undefined };
		return _elm_lang$core$Native_Platform.initialize(
			flagChecker(impl.init, flags, document.body),
			impl.update(scrollTask(popoutRef)),
			impl.subscriptions,
			debugRenderer(moduleName, document.body, popoutRef, impl.view, impl.viewIn, impl.viewOut)
		);
	};

	object['embed'] = function fullscreen(node, flags)
	{
		var popoutRef = { doc: undefined };
		return _elm_lang$core$Native_Platform.initialize(
			flagChecker(impl.init, flags, node),
			impl.update(scrollTask(popoutRef)),
			impl.subscriptions,
			debugRenderer(moduleName, node, popoutRef, impl.view, impl.viewIn, impl.viewOut)
		);
	};
}

function scrollTask(popoutRef)
{
	return _elm_lang$core$Native_Scheduler.nativeBinding(function(callback)
	{
		var doc = popoutRef.doc;
		if (doc)
		{
			var msgs = doc.getElementsByClassName('debugger-sidebar-messages')[0];
			if (msgs)
			{
				msgs.scrollTop = msgs.scrollHeight;
			}
		}
		callback(_elm_lang$core$Native_Scheduler.succeed(_elm_lang$core$Native_Utils.Tuple0));
	});
}


function debugRenderer(moduleName, parentNode, popoutRef, view, viewIn, viewOut)
{
	return function(tagger, initialModel)
	{
		var appEventNode = { tagger: tagger, parent: undefined };
		var eventNode = { tagger: tagger, parent: undefined };

		// make normal stepper
		var appVirtualNode = view(initialModel);
		var appNode = render(appVirtualNode, appEventNode);
		parentNode.appendChild(appNode);
		var appStepper = makeStepper(appNode, view, appVirtualNode, appEventNode);

		// make overlay stepper
		var overVirtualNode = viewIn(initialModel)._1;
		var overNode = render(overVirtualNode, eventNode);
		parentNode.appendChild(overNode);
		var wrappedViewIn = wrapViewIn(appEventNode, overNode, viewIn);
		var overStepper = makeStepper(overNode, wrappedViewIn, overVirtualNode, eventNode);

		// make debugger stepper
		var debugStepper = makeDebugStepper(initialModel, viewOut, eventNode, parentNode, moduleName, popoutRef);

		return function stepper(model)
		{
			appStepper(model);
			overStepper(model);
			debugStepper(model);
		}
	};
}

function makeDebugStepper(initialModel, view, eventNode, parentNode, moduleName, popoutRef)
{
	var curr;
	var domNode;

	return function stepper(model)
	{
		if (!model.isDebuggerOpen)
		{
			return;
		}

		if (!popoutRef.doc)
		{
			curr = view(model);
			domNode = openDebugWindow(moduleName, popoutRef, curr, eventNode);
			return;
		}

		// switch to document of popout
		localDoc = popoutRef.doc;

		var next = view(model);
		var patches = diff(curr, next);
		domNode = applyPatches(domNode, curr, patches, eventNode);
		curr = next;

		// switch back to normal document
		localDoc = document;
	};
}

function openDebugWindow(moduleName, popoutRef, virtualNode, eventNode)
{
	var w = 900;
	var h = 360;
	var x = screen.width - w;
	var y = screen.height - h;
	var debugWindow = window.open('', '', 'width=' + w + ',height=' + h + ',left=' + x + ',top=' + y);

	// switch to window document
	localDoc = debugWindow.document;

	popoutRef.doc = localDoc;
	localDoc.title = 'Debugger - ' + moduleName;
	localDoc.body.style.margin = '0';
	localDoc.body.style.padding = '0';
	var domNode = render(virtualNode, eventNode);
	localDoc.body.appendChild(domNode);

	localDoc.addEventListener('keydown', function(event) {
		if (event.metaKey && event.which === 82)
		{
			window.location.reload();
		}
		if (event.which === 38)
		{
			eventNode.tagger({ ctor: 'Up' });
			event.preventDefault();
		}
		if (event.which === 40)
		{
			eventNode.tagger({ ctor: 'Down' });
			event.preventDefault();
		}
	});

	function close()
	{
		popoutRef.doc = undefined;
		debugWindow.close();
	}
	window.addEventListener('unload', close);
	debugWindow.addEventListener('unload', function() {
		popoutRef.doc = undefined;
		window.removeEventListener('unload', close);
		eventNode.tagger({ ctor: 'Close' });
	});

	// switch back to the normal document
	localDoc = document;

	return domNode;
}


// BLOCK EVENTS

function wrapViewIn(appEventNode, overlayNode, viewIn)
{
	var ignorer = makeIgnorer(overlayNode);
	var blocking = 'Normal';
	var overflow;

	var normalTagger = appEventNode.tagger;
	var blockTagger = function() {};

	return function(model)
	{
		var tuple = viewIn(model);
		var newBlocking = tuple._0.ctor;
		appEventNode.tagger = newBlocking === 'Normal' ? normalTagger : blockTagger;
		if (blocking !== newBlocking)
		{
			traverse('removeEventListener', ignorer, blocking);
			traverse('addEventListener', ignorer, newBlocking);

			if (blocking === 'Normal')
			{
				overflow = document.body.style.overflow;
				document.body.style.overflow = 'hidden';
			}

			if (newBlocking === 'Normal')
			{
				document.body.style.overflow = overflow;
			}

			blocking = newBlocking;
		}
		return tuple._1;
	}
}

function traverse(verbEventListener, ignorer, blocking)
{
	switch(blocking)
	{
		case 'Normal':
			return;

		case 'Pause':
			return traverseHelp(verbEventListener, ignorer, mostEvents);

		case 'Message':
			return traverseHelp(verbEventListener, ignorer, allEvents);
	}
}

function traverseHelp(verbEventListener, handler, eventNames)
{
	for (var i = 0; i < eventNames.length; i++)
	{
		document.body[verbEventListener](eventNames[i], handler, true);
	}
}

function makeIgnorer(overlayNode)
{
	return function(event)
	{
		if (event.type === 'keydown' && event.metaKey && event.which === 82)
		{
			return;
		}

		var isScroll = event.type === 'scroll' || event.type === 'wheel';

		var node = event.target;
		while (node !== null)
		{
			if (node.className === 'elm-overlay-message-details' && isScroll)
			{
				return;
			}

			if (node === overlayNode && !isScroll)
			{
				return;
			}
			node = node.parentNode;
		}

		event.stopPropagation();
		event.preventDefault();
	}
}

var mostEvents = [
	'click', 'dblclick', 'mousemove',
	'mouseup', 'mousedown', 'mouseenter', 'mouseleave',
	'touchstart', 'touchend', 'touchcancel', 'touchmove',
	'pointerdown', 'pointerup', 'pointerover', 'pointerout',
	'pointerenter', 'pointerleave', 'pointermove', 'pointercancel',
	'dragstart', 'drag', 'dragend', 'dragenter', 'dragover', 'dragleave', 'drop',
	'keyup', 'keydown', 'keypress',
	'input', 'change',
	'focus', 'blur'
];

var allEvents = mostEvents.concat('wheel', 'scroll');


return {
	node: node,
	text: text,
	custom: custom,
	map: F2(map),

	on: F3(on),
	style: style,
	property: F2(property),
	attribute: F2(attribute),
	attributeNS: F3(attributeNS),
	mapProperty: F2(mapProperty),

	lazy: F2(lazy),
	lazy2: F3(lazy2),
	lazy3: F4(lazy3),
	keyedNode: F3(keyedNode),

	program: program,
	programWithFlags: programWithFlags,
	staticProgram: staticProgram
};

}();

var _elm_lang$virtual_dom$VirtualDom$programWithFlags = function (impl) {
	return A2(_elm_lang$virtual_dom$Native_VirtualDom.programWithFlags, _elm_lang$virtual_dom$VirtualDom_Debug$wrapWithFlags, impl);
};
var _elm_lang$virtual_dom$VirtualDom$program = function (impl) {
	return A2(_elm_lang$virtual_dom$Native_VirtualDom.program, _elm_lang$virtual_dom$VirtualDom_Debug$wrap, impl);
};
var _elm_lang$virtual_dom$VirtualDom$keyedNode = _elm_lang$virtual_dom$Native_VirtualDom.keyedNode;
var _elm_lang$virtual_dom$VirtualDom$lazy3 = _elm_lang$virtual_dom$Native_VirtualDom.lazy3;
var _elm_lang$virtual_dom$VirtualDom$lazy2 = _elm_lang$virtual_dom$Native_VirtualDom.lazy2;
var _elm_lang$virtual_dom$VirtualDom$lazy = _elm_lang$virtual_dom$Native_VirtualDom.lazy;
var _elm_lang$virtual_dom$VirtualDom$defaultOptions = {stopPropagation: false, preventDefault: false};
var _elm_lang$virtual_dom$VirtualDom$onWithOptions = _elm_lang$virtual_dom$Native_VirtualDom.on;
var _elm_lang$virtual_dom$VirtualDom$on = F2(
	function (eventName, decoder) {
		return A3(_elm_lang$virtual_dom$VirtualDom$onWithOptions, eventName, _elm_lang$virtual_dom$VirtualDom$defaultOptions, decoder);
	});
var _elm_lang$virtual_dom$VirtualDom$style = _elm_lang$virtual_dom$Native_VirtualDom.style;
var _elm_lang$virtual_dom$VirtualDom$mapProperty = _elm_lang$virtual_dom$Native_VirtualDom.mapProperty;
var _elm_lang$virtual_dom$VirtualDom$attributeNS = _elm_lang$virtual_dom$Native_VirtualDom.attributeNS;
var _elm_lang$virtual_dom$VirtualDom$attribute = _elm_lang$virtual_dom$Native_VirtualDom.attribute;
var _elm_lang$virtual_dom$VirtualDom$property = _elm_lang$virtual_dom$Native_VirtualDom.property;
var _elm_lang$virtual_dom$VirtualDom$map = _elm_lang$virtual_dom$Native_VirtualDom.map;
var _elm_lang$virtual_dom$VirtualDom$text = _elm_lang$virtual_dom$Native_VirtualDom.text;
var _elm_lang$virtual_dom$VirtualDom$node = _elm_lang$virtual_dom$Native_VirtualDom.node;
var _elm_lang$virtual_dom$VirtualDom$Options = F2(
	function (a, b) {
		return {stopPropagation: a, preventDefault: b};
	});
var _elm_lang$virtual_dom$VirtualDom$Node = {ctor: 'Node'};
var _elm_lang$virtual_dom$VirtualDom$Property = {ctor: 'Property'};

var _elm_lang$html$Html$programWithFlags = _elm_lang$virtual_dom$VirtualDom$programWithFlags;
var _elm_lang$html$Html$program = _elm_lang$virtual_dom$VirtualDom$program;
var _elm_lang$html$Html$beginnerProgram = function (_p0) {
	var _p1 = _p0;
	return _elm_lang$html$Html$program(
		{
			init: A2(
				_elm_lang$core$Platform_Cmd_ops['!'],
				_p1.model,
				{ctor: '[]'}),
			update: F2(
				function (msg, model) {
					return A2(
						_elm_lang$core$Platform_Cmd_ops['!'],
						A2(_p1.update, msg, model),
						{ctor: '[]'});
				}),
			view: _p1.view,
			subscriptions: function (_p2) {
				return _elm_lang$core$Platform_Sub$none;
			}
		});
};
var _elm_lang$html$Html$map = _elm_lang$virtual_dom$VirtualDom$map;
var _elm_lang$html$Html$text = _elm_lang$virtual_dom$VirtualDom$text;
var _elm_lang$html$Html$node = _elm_lang$virtual_dom$VirtualDom$node;
var _elm_lang$html$Html$body = _elm_lang$html$Html$node('body');
var _elm_lang$html$Html$section = _elm_lang$html$Html$node('section');
var _elm_lang$html$Html$nav = _elm_lang$html$Html$node('nav');
var _elm_lang$html$Html$article = _elm_lang$html$Html$node('article');
var _elm_lang$html$Html$aside = _elm_lang$html$Html$node('aside');
var _elm_lang$html$Html$h1 = _elm_lang$html$Html$node('h1');
var _elm_lang$html$Html$h2 = _elm_lang$html$Html$node('h2');
var _elm_lang$html$Html$h3 = _elm_lang$html$Html$node('h3');
var _elm_lang$html$Html$h4 = _elm_lang$html$Html$node('h4');
var _elm_lang$html$Html$h5 = _elm_lang$html$Html$node('h5');
var _elm_lang$html$Html$h6 = _elm_lang$html$Html$node('h6');
var _elm_lang$html$Html$header = _elm_lang$html$Html$node('header');
var _elm_lang$html$Html$footer = _elm_lang$html$Html$node('footer');
var _elm_lang$html$Html$address = _elm_lang$html$Html$node('address');
var _elm_lang$html$Html$main_ = _elm_lang$html$Html$node('main');
var _elm_lang$html$Html$p = _elm_lang$html$Html$node('p');
var _elm_lang$html$Html$hr = _elm_lang$html$Html$node('hr');
var _elm_lang$html$Html$pre = _elm_lang$html$Html$node('pre');
var _elm_lang$html$Html$blockquote = _elm_lang$html$Html$node('blockquote');
var _elm_lang$html$Html$ol = _elm_lang$html$Html$node('ol');
var _elm_lang$html$Html$ul = _elm_lang$html$Html$node('ul');
var _elm_lang$html$Html$li = _elm_lang$html$Html$node('li');
var _elm_lang$html$Html$dl = _elm_lang$html$Html$node('dl');
var _elm_lang$html$Html$dt = _elm_lang$html$Html$node('dt');
var _elm_lang$html$Html$dd = _elm_lang$html$Html$node('dd');
var _elm_lang$html$Html$figure = _elm_lang$html$Html$node('figure');
var _elm_lang$html$Html$figcaption = _elm_lang$html$Html$node('figcaption');
var _elm_lang$html$Html$div = _elm_lang$html$Html$node('div');
var _elm_lang$html$Html$a = _elm_lang$html$Html$node('a');
var _elm_lang$html$Html$em = _elm_lang$html$Html$node('em');
var _elm_lang$html$Html$strong = _elm_lang$html$Html$node('strong');
var _elm_lang$html$Html$small = _elm_lang$html$Html$node('small');
var _elm_lang$html$Html$s = _elm_lang$html$Html$node('s');
var _elm_lang$html$Html$cite = _elm_lang$html$Html$node('cite');
var _elm_lang$html$Html$q = _elm_lang$html$Html$node('q');
var _elm_lang$html$Html$dfn = _elm_lang$html$Html$node('dfn');
var _elm_lang$html$Html$abbr = _elm_lang$html$Html$node('abbr');
var _elm_lang$html$Html$time = _elm_lang$html$Html$node('time');
var _elm_lang$html$Html$code = _elm_lang$html$Html$node('code');
var _elm_lang$html$Html$var = _elm_lang$html$Html$node('var');
var _elm_lang$html$Html$samp = _elm_lang$html$Html$node('samp');
var _elm_lang$html$Html$kbd = _elm_lang$html$Html$node('kbd');
var _elm_lang$html$Html$sub = _elm_lang$html$Html$node('sub');
var _elm_lang$html$Html$sup = _elm_lang$html$Html$node('sup');
var _elm_lang$html$Html$i = _elm_lang$html$Html$node('i');
var _elm_lang$html$Html$b = _elm_lang$html$Html$node('b');
var _elm_lang$html$Html$u = _elm_lang$html$Html$node('u');
var _elm_lang$html$Html$mark = _elm_lang$html$Html$node('mark');
var _elm_lang$html$Html$ruby = _elm_lang$html$Html$node('ruby');
var _elm_lang$html$Html$rt = _elm_lang$html$Html$node('rt');
var _elm_lang$html$Html$rp = _elm_lang$html$Html$node('rp');
var _elm_lang$html$Html$bdi = _elm_lang$html$Html$node('bdi');
var _elm_lang$html$Html$bdo = _elm_lang$html$Html$node('bdo');
var _elm_lang$html$Html$span = _elm_lang$html$Html$node('span');
var _elm_lang$html$Html$br = _elm_lang$html$Html$node('br');
var _elm_lang$html$Html$wbr = _elm_lang$html$Html$node('wbr');
var _elm_lang$html$Html$ins = _elm_lang$html$Html$node('ins');
var _elm_lang$html$Html$del = _elm_lang$html$Html$node('del');
var _elm_lang$html$Html$img = _elm_lang$html$Html$node('img');
var _elm_lang$html$Html$iframe = _elm_lang$html$Html$node('iframe');
var _elm_lang$html$Html$embed = _elm_lang$html$Html$node('embed');
var _elm_lang$html$Html$object = _elm_lang$html$Html$node('object');
var _elm_lang$html$Html$param = _elm_lang$html$Html$node('param');
var _elm_lang$html$Html$video = _elm_lang$html$Html$node('video');
var _elm_lang$html$Html$audio = _elm_lang$html$Html$node('audio');
var _elm_lang$html$Html$source = _elm_lang$html$Html$node('source');
var _elm_lang$html$Html$track = _elm_lang$html$Html$node('track');
var _elm_lang$html$Html$canvas = _elm_lang$html$Html$node('canvas');
var _elm_lang$html$Html$math = _elm_lang$html$Html$node('math');
var _elm_lang$html$Html$table = _elm_lang$html$Html$node('table');
var _elm_lang$html$Html$caption = _elm_lang$html$Html$node('caption');
var _elm_lang$html$Html$colgroup = _elm_lang$html$Html$node('colgroup');
var _elm_lang$html$Html$col = _elm_lang$html$Html$node('col');
var _elm_lang$html$Html$tbody = _elm_lang$html$Html$node('tbody');
var _elm_lang$html$Html$thead = _elm_lang$html$Html$node('thead');
var _elm_lang$html$Html$tfoot = _elm_lang$html$Html$node('tfoot');
var _elm_lang$html$Html$tr = _elm_lang$html$Html$node('tr');
var _elm_lang$html$Html$td = _elm_lang$html$Html$node('td');
var _elm_lang$html$Html$th = _elm_lang$html$Html$node('th');
var _elm_lang$html$Html$form = _elm_lang$html$Html$node('form');
var _elm_lang$html$Html$fieldset = _elm_lang$html$Html$node('fieldset');
var _elm_lang$html$Html$legend = _elm_lang$html$Html$node('legend');
var _elm_lang$html$Html$label = _elm_lang$html$Html$node('label');
var _elm_lang$html$Html$input = _elm_lang$html$Html$node('input');
var _elm_lang$html$Html$button = _elm_lang$html$Html$node('button');
var _elm_lang$html$Html$select = _elm_lang$html$Html$node('select');
var _elm_lang$html$Html$datalist = _elm_lang$html$Html$node('datalist');
var _elm_lang$html$Html$optgroup = _elm_lang$html$Html$node('optgroup');
var _elm_lang$html$Html$option = _elm_lang$html$Html$node('option');
var _elm_lang$html$Html$textarea = _elm_lang$html$Html$node('textarea');
var _elm_lang$html$Html$keygen = _elm_lang$html$Html$node('keygen');
var _elm_lang$html$Html$output = _elm_lang$html$Html$node('output');
var _elm_lang$html$Html$progress = _elm_lang$html$Html$node('progress');
var _elm_lang$html$Html$meter = _elm_lang$html$Html$node('meter');
var _elm_lang$html$Html$details = _elm_lang$html$Html$node('details');
var _elm_lang$html$Html$summary = _elm_lang$html$Html$node('summary');
var _elm_lang$html$Html$menuitem = _elm_lang$html$Html$node('menuitem');
var _elm_lang$html$Html$menu = _elm_lang$html$Html$node('menu');

var _elm_lang$html$Html_Attributes$map = _elm_lang$virtual_dom$VirtualDom$mapProperty;
var _elm_lang$html$Html_Attributes$attribute = _elm_lang$virtual_dom$VirtualDom$attribute;
var _elm_lang$html$Html_Attributes$contextmenu = function (value) {
	return A2(_elm_lang$html$Html_Attributes$attribute, 'contextmenu', value);
};
var _elm_lang$html$Html_Attributes$draggable = function (value) {
	return A2(_elm_lang$html$Html_Attributes$attribute, 'draggable', value);
};
var _elm_lang$html$Html_Attributes$itemprop = function (value) {
	return A2(_elm_lang$html$Html_Attributes$attribute, 'itemprop', value);
};
var _elm_lang$html$Html_Attributes$tabindex = function (n) {
	return A2(
		_elm_lang$html$Html_Attributes$attribute,
		'tabIndex',
		_elm_lang$core$Basics$toString(n));
};
var _elm_lang$html$Html_Attributes$charset = function (value) {
	return A2(_elm_lang$html$Html_Attributes$attribute, 'charset', value);
};
var _elm_lang$html$Html_Attributes$height = function (value) {
	return A2(
		_elm_lang$html$Html_Attributes$attribute,
		'height',
		_elm_lang$core$Basics$toString(value));
};
var _elm_lang$html$Html_Attributes$width = function (value) {
	return A2(
		_elm_lang$html$Html_Attributes$attribute,
		'width',
		_elm_lang$core$Basics$toString(value));
};
var _elm_lang$html$Html_Attributes$formaction = function (value) {
	return A2(_elm_lang$html$Html_Attributes$attribute, 'formAction', value);
};
var _elm_lang$html$Html_Attributes$list = function (value) {
	return A2(_elm_lang$html$Html_Attributes$attribute, 'list', value);
};
var _elm_lang$html$Html_Attributes$minlength = function (n) {
	return A2(
		_elm_lang$html$Html_Attributes$attribute,
		'minLength',
		_elm_lang$core$Basics$toString(n));
};
var _elm_lang$html$Html_Attributes$maxlength = function (n) {
	return A2(
		_elm_lang$html$Html_Attributes$attribute,
		'maxlength',
		_elm_lang$core$Basics$toString(n));
};
var _elm_lang$html$Html_Attributes$size = function (n) {
	return A2(
		_elm_lang$html$Html_Attributes$attribute,
		'size',
		_elm_lang$core$Basics$toString(n));
};
var _elm_lang$html$Html_Attributes$form = function (value) {
	return A2(_elm_lang$html$Html_Attributes$attribute, 'form', value);
};
var _elm_lang$html$Html_Attributes$cols = function (n) {
	return A2(
		_elm_lang$html$Html_Attributes$attribute,
		'cols',
		_elm_lang$core$Basics$toString(n));
};
var _elm_lang$html$Html_Attributes$rows = function (n) {
	return A2(
		_elm_lang$html$Html_Attributes$attribute,
		'rows',
		_elm_lang$core$Basics$toString(n));
};
var _elm_lang$html$Html_Attributes$challenge = function (value) {
	return A2(_elm_lang$html$Html_Attributes$attribute, 'challenge', value);
};
var _elm_lang$html$Html_Attributes$media = function (value) {
	return A2(_elm_lang$html$Html_Attributes$attribute, 'media', value);
};
var _elm_lang$html$Html_Attributes$rel = function (value) {
	return A2(_elm_lang$html$Html_Attributes$attribute, 'rel', value);
};
var _elm_lang$html$Html_Attributes$datetime = function (value) {
	return A2(_elm_lang$html$Html_Attributes$attribute, 'datetime', value);
};
var _elm_lang$html$Html_Attributes$pubdate = function (value) {
	return A2(_elm_lang$html$Html_Attributes$attribute, 'pubdate', value);
};
var _elm_lang$html$Html_Attributes$colspan = function (n) {
	return A2(
		_elm_lang$html$Html_Attributes$attribute,
		'colspan',
		_elm_lang$core$Basics$toString(n));
};
var _elm_lang$html$Html_Attributes$rowspan = function (n) {
	return A2(
		_elm_lang$html$Html_Attributes$attribute,
		'rowspan',
		_elm_lang$core$Basics$toString(n));
};
var _elm_lang$html$Html_Attributes$manifest = function (value) {
	return A2(_elm_lang$html$Html_Attributes$attribute, 'manifest', value);
};
var _elm_lang$html$Html_Attributes$property = _elm_lang$virtual_dom$VirtualDom$property;
var _elm_lang$html$Html_Attributes$stringProperty = F2(
	function (name, string) {
		return A2(
			_elm_lang$html$Html_Attributes$property,
			name,
			_elm_lang$core$Json_Encode$string(string));
	});
var _elm_lang$html$Html_Attributes$class = function (name) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'className', name);
};
var _elm_lang$html$Html_Attributes$id = function (name) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'id', name);
};
var _elm_lang$html$Html_Attributes$title = function (name) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'title', name);
};
var _elm_lang$html$Html_Attributes$accesskey = function ($char) {
	return A2(
		_elm_lang$html$Html_Attributes$stringProperty,
		'accessKey',
		_elm_lang$core$String$fromChar($char));
};
var _elm_lang$html$Html_Attributes$dir = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'dir', value);
};
var _elm_lang$html$Html_Attributes$dropzone = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'dropzone', value);
};
var _elm_lang$html$Html_Attributes$lang = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'lang', value);
};
var _elm_lang$html$Html_Attributes$content = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'content', value);
};
var _elm_lang$html$Html_Attributes$httpEquiv = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'httpEquiv', value);
};
var _elm_lang$html$Html_Attributes$language = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'language', value);
};
var _elm_lang$html$Html_Attributes$src = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'src', value);
};
var _elm_lang$html$Html_Attributes$alt = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'alt', value);
};
var _elm_lang$html$Html_Attributes$preload = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'preload', value);
};
var _elm_lang$html$Html_Attributes$poster = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'poster', value);
};
var _elm_lang$html$Html_Attributes$kind = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'kind', value);
};
var _elm_lang$html$Html_Attributes$srclang = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'srclang', value);
};
var _elm_lang$html$Html_Attributes$sandbox = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'sandbox', value);
};
var _elm_lang$html$Html_Attributes$srcdoc = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'srcdoc', value);
};
var _elm_lang$html$Html_Attributes$type_ = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'type', value);
};
var _elm_lang$html$Html_Attributes$value = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'value', value);
};
var _elm_lang$html$Html_Attributes$defaultValue = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'defaultValue', value);
};
var _elm_lang$html$Html_Attributes$placeholder = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'placeholder', value);
};
var _elm_lang$html$Html_Attributes$accept = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'accept', value);
};
var _elm_lang$html$Html_Attributes$acceptCharset = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'acceptCharset', value);
};
var _elm_lang$html$Html_Attributes$action = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'action', value);
};
var _elm_lang$html$Html_Attributes$autocomplete = function (bool) {
	return A2(
		_elm_lang$html$Html_Attributes$stringProperty,
		'autocomplete',
		bool ? 'on' : 'off');
};
var _elm_lang$html$Html_Attributes$enctype = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'enctype', value);
};
var _elm_lang$html$Html_Attributes$method = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'method', value);
};
var _elm_lang$html$Html_Attributes$name = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'name', value);
};
var _elm_lang$html$Html_Attributes$pattern = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'pattern', value);
};
var _elm_lang$html$Html_Attributes$for = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'htmlFor', value);
};
var _elm_lang$html$Html_Attributes$max = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'max', value);
};
var _elm_lang$html$Html_Attributes$min = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'min', value);
};
var _elm_lang$html$Html_Attributes$step = function (n) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'step', n);
};
var _elm_lang$html$Html_Attributes$wrap = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'wrap', value);
};
var _elm_lang$html$Html_Attributes$usemap = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'useMap', value);
};
var _elm_lang$html$Html_Attributes$shape = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'shape', value);
};
var _elm_lang$html$Html_Attributes$coords = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'coords', value);
};
var _elm_lang$html$Html_Attributes$keytype = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'keytype', value);
};
var _elm_lang$html$Html_Attributes$align = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'align', value);
};
var _elm_lang$html$Html_Attributes$cite = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'cite', value);
};
var _elm_lang$html$Html_Attributes$href = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'href', value);
};
var _elm_lang$html$Html_Attributes$target = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'target', value);
};
var _elm_lang$html$Html_Attributes$downloadAs = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'download', value);
};
var _elm_lang$html$Html_Attributes$hreflang = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'hreflang', value);
};
var _elm_lang$html$Html_Attributes$ping = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'ping', value);
};
var _elm_lang$html$Html_Attributes$start = function (n) {
	return A2(
		_elm_lang$html$Html_Attributes$stringProperty,
		'start',
		_elm_lang$core$Basics$toString(n));
};
var _elm_lang$html$Html_Attributes$headers = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'headers', value);
};
var _elm_lang$html$Html_Attributes$scope = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'scope', value);
};
var _elm_lang$html$Html_Attributes$boolProperty = F2(
	function (name, bool) {
		return A2(
			_elm_lang$html$Html_Attributes$property,
			name,
			_elm_lang$core$Json_Encode$bool(bool));
	});
var _elm_lang$html$Html_Attributes$hidden = function (bool) {
	return A2(_elm_lang$html$Html_Attributes$boolProperty, 'hidden', bool);
};
var _elm_lang$html$Html_Attributes$contenteditable = function (bool) {
	return A2(_elm_lang$html$Html_Attributes$boolProperty, 'contentEditable', bool);
};
var _elm_lang$html$Html_Attributes$spellcheck = function (bool) {
	return A2(_elm_lang$html$Html_Attributes$boolProperty, 'spellcheck', bool);
};
var _elm_lang$html$Html_Attributes$async = function (bool) {
	return A2(_elm_lang$html$Html_Attributes$boolProperty, 'async', bool);
};
var _elm_lang$html$Html_Attributes$defer = function (bool) {
	return A2(_elm_lang$html$Html_Attributes$boolProperty, 'defer', bool);
};
var _elm_lang$html$Html_Attributes$scoped = function (bool) {
	return A2(_elm_lang$html$Html_Attributes$boolProperty, 'scoped', bool);
};
var _elm_lang$html$Html_Attributes$autoplay = function (bool) {
	return A2(_elm_lang$html$Html_Attributes$boolProperty, 'autoplay', bool);
};
var _elm_lang$html$Html_Attributes$controls = function (bool) {
	return A2(_elm_lang$html$Html_Attributes$boolProperty, 'controls', bool);
};
var _elm_lang$html$Html_Attributes$loop = function (bool) {
	return A2(_elm_lang$html$Html_Attributes$boolProperty, 'loop', bool);
};
var _elm_lang$html$Html_Attributes$default = function (bool) {
	return A2(_elm_lang$html$Html_Attributes$boolProperty, 'default', bool);
};
var _elm_lang$html$Html_Attributes$seamless = function (bool) {
	return A2(_elm_lang$html$Html_Attributes$boolProperty, 'seamless', bool);
};
var _elm_lang$html$Html_Attributes$checked = function (bool) {
	return A2(_elm_lang$html$Html_Attributes$boolProperty, 'checked', bool);
};
var _elm_lang$html$Html_Attributes$selected = function (bool) {
	return A2(_elm_lang$html$Html_Attributes$boolProperty, 'selected', bool);
};
var _elm_lang$html$Html_Attributes$autofocus = function (bool) {
	return A2(_elm_lang$html$Html_Attributes$boolProperty, 'autofocus', bool);
};
var _elm_lang$html$Html_Attributes$disabled = function (bool) {
	return A2(_elm_lang$html$Html_Attributes$boolProperty, 'disabled', bool);
};
var _elm_lang$html$Html_Attributes$multiple = function (bool) {
	return A2(_elm_lang$html$Html_Attributes$boolProperty, 'multiple', bool);
};
var _elm_lang$html$Html_Attributes$novalidate = function (bool) {
	return A2(_elm_lang$html$Html_Attributes$boolProperty, 'noValidate', bool);
};
var _elm_lang$html$Html_Attributes$readonly = function (bool) {
	return A2(_elm_lang$html$Html_Attributes$boolProperty, 'readOnly', bool);
};
var _elm_lang$html$Html_Attributes$required = function (bool) {
	return A2(_elm_lang$html$Html_Attributes$boolProperty, 'required', bool);
};
var _elm_lang$html$Html_Attributes$ismap = function (value) {
	return A2(_elm_lang$html$Html_Attributes$boolProperty, 'isMap', value);
};
var _elm_lang$html$Html_Attributes$download = function (bool) {
	return A2(_elm_lang$html$Html_Attributes$boolProperty, 'download', bool);
};
var _elm_lang$html$Html_Attributes$reversed = function (bool) {
	return A2(_elm_lang$html$Html_Attributes$boolProperty, 'reversed', bool);
};
var _elm_lang$html$Html_Attributes$classList = function (list) {
	return _elm_lang$html$Html_Attributes$class(
		A2(
			_elm_lang$core$String$join,
			' ',
			A2(
				_elm_lang$core$List$map,
				_elm_lang$core$Tuple$first,
				A2(_elm_lang$core$List$filter, _elm_lang$core$Tuple$second, list))));
};
var _elm_lang$html$Html_Attributes$style = _elm_lang$virtual_dom$VirtualDom$style;

var _elm_lang$html$Html_Events$keyCode = A2(_elm_lang$core$Json_Decode$field, 'keyCode', _elm_lang$core$Json_Decode$int);
var _elm_lang$html$Html_Events$targetChecked = A2(
	_elm_lang$core$Json_Decode$at,
	{
		ctor: '::',
		_0: 'target',
		_1: {
			ctor: '::',
			_0: 'checked',
			_1: {ctor: '[]'}
		}
	},
	_elm_lang$core$Json_Decode$bool);
var _elm_lang$html$Html_Events$targetValue = A2(
	_elm_lang$core$Json_Decode$at,
	{
		ctor: '::',
		_0: 'target',
		_1: {
			ctor: '::',
			_0: 'value',
			_1: {ctor: '[]'}
		}
	},
	_elm_lang$core$Json_Decode$string);
var _elm_lang$html$Html_Events$defaultOptions = _elm_lang$virtual_dom$VirtualDom$defaultOptions;
var _elm_lang$html$Html_Events$onWithOptions = _elm_lang$virtual_dom$VirtualDom$onWithOptions;
var _elm_lang$html$Html_Events$on = _elm_lang$virtual_dom$VirtualDom$on;
var _elm_lang$html$Html_Events$onFocus = function (msg) {
	return A2(
		_elm_lang$html$Html_Events$on,
		'focus',
		_elm_lang$core$Json_Decode$succeed(msg));
};
var _elm_lang$html$Html_Events$onBlur = function (msg) {
	return A2(
		_elm_lang$html$Html_Events$on,
		'blur',
		_elm_lang$core$Json_Decode$succeed(msg));
};
var _elm_lang$html$Html_Events$onSubmitOptions = _elm_lang$core$Native_Utils.update(
	_elm_lang$html$Html_Events$defaultOptions,
	{preventDefault: true});
var _elm_lang$html$Html_Events$onSubmit = function (msg) {
	return A3(
		_elm_lang$html$Html_Events$onWithOptions,
		'submit',
		_elm_lang$html$Html_Events$onSubmitOptions,
		_elm_lang$core$Json_Decode$succeed(msg));
};
var _elm_lang$html$Html_Events$onCheck = function (tagger) {
	return A2(
		_elm_lang$html$Html_Events$on,
		'change',
		A2(_elm_lang$core$Json_Decode$map, tagger, _elm_lang$html$Html_Events$targetChecked));
};
var _elm_lang$html$Html_Events$onInput = function (tagger) {
	return A2(
		_elm_lang$html$Html_Events$on,
		'input',
		A2(_elm_lang$core$Json_Decode$map, tagger, _elm_lang$html$Html_Events$targetValue));
};
var _elm_lang$html$Html_Events$onMouseOut = function (msg) {
	return A2(
		_elm_lang$html$Html_Events$on,
		'mouseout',
		_elm_lang$core$Json_Decode$succeed(msg));
};
var _elm_lang$html$Html_Events$onMouseOver = function (msg) {
	return A2(
		_elm_lang$html$Html_Events$on,
		'mouseover',
		_elm_lang$core$Json_Decode$succeed(msg));
};
var _elm_lang$html$Html_Events$onMouseLeave = function (msg) {
	return A2(
		_elm_lang$html$Html_Events$on,
		'mouseleave',
		_elm_lang$core$Json_Decode$succeed(msg));
};
var _elm_lang$html$Html_Events$onMouseEnter = function (msg) {
	return A2(
		_elm_lang$html$Html_Events$on,
		'mouseenter',
		_elm_lang$core$Json_Decode$succeed(msg));
};
var _elm_lang$html$Html_Events$onMouseUp = function (msg) {
	return A2(
		_elm_lang$html$Html_Events$on,
		'mouseup',
		_elm_lang$core$Json_Decode$succeed(msg));
};
var _elm_lang$html$Html_Events$onMouseDown = function (msg) {
	return A2(
		_elm_lang$html$Html_Events$on,
		'mousedown',
		_elm_lang$core$Json_Decode$succeed(msg));
};
var _elm_lang$html$Html_Events$onDoubleClick = function (msg) {
	return A2(
		_elm_lang$html$Html_Events$on,
		'dblclick',
		_elm_lang$core$Json_Decode$succeed(msg));
};
var _elm_lang$html$Html_Events$onClick = function (msg) {
	return A2(
		_elm_lang$html$Html_Events$on,
		'click',
		_elm_lang$core$Json_Decode$succeed(msg));
};
var _elm_lang$html$Html_Events$Options = F2(
	function (a, b) {
		return {stopPropagation: a, preventDefault: b};
	});

var _fifth_postulate$trade_card$TradeCard_Card$leftPad = F3(
	function (original, target, padding) {
		leftPad:
		while (true) {
			if (_elm_lang$core$Native_Utils.cmp(
				_elm_lang$core$String$length(original),
				target) < 0) {
				var _v0 = A2(_elm_lang$core$Basics_ops['++'], padding, original),
					_v1 = target,
					_v2 = padding;
				original = _v0;
				target = _v1;
				padding = _v2;
				continue leftPad;
			} else {
				return original;
			}
		}
	});
var _fifth_postulate$trade_card$TradeCard_Card$cardFace = function (card) {
	return A3(
		_fifth_postulate$trade_card$TradeCard_Card$leftPad,
		_elm_lang$core$Basics$toString(card.id),
		3,
		'0');
};
var _fifth_postulate$trade_card$TradeCard_Card$view = F2(
	function (message, card) {
		var cardId = A2(
			_elm_lang$core$Basics_ops['++'],
			'card-',
			_elm_lang$core$Basics$toString(card.id));
		return A2(
			_elm_lang$html$Html$div,
			{
				ctor: '::',
				_0: _elm_lang$html$Html_Attributes$classList(
					{
						ctor: '::',
						_0: {ctor: '_Tuple2', _0: 'card', _1: true},
						_1: {
							ctor: '::',
							_0: {ctor: '_Tuple2', _0: cardId, _1: true},
							_1: {ctor: '[]'}
						}
					}),
				_1: {
					ctor: '::',
					_0: _elm_lang$html$Html_Events$onClick(
						message(card)),
					_1: {ctor: '[]'}
				}
			},
			{
				ctor: '::',
				_0: A2(
					_elm_lang$html$Html$span,
					{ctor: '[]'},
					{
						ctor: '::',
						_0: _elm_lang$html$Html$text(
							_fifth_postulate$trade_card$TradeCard_Card$cardFace(card)),
						_1: {ctor: '[]'}
					}),
				_1: {ctor: '[]'}
			});
	});
var _fifth_postulate$trade_card$TradeCard_Card$Card = function (a) {
	return {id: a};
};

var _fifth_postulate$trade_card$TradeCard_Collection$negate = F2(
	function (predicate, value) {
		return !predicate(value);
	});
var _fifth_postulate$trade_card$TradeCard_Collection$isCollected = F2(
	function (collection, id) {
		return A2(_elm_lang$core$Dict$member, id, collection.collected);
	});
var _fifth_postulate$trade_card$TradeCard_Collection$missing = function (collection) {
	return A2(
		_elm_lang$core$List$map,
		function (id) {
			return {id: id};
		},
		A2(
			_elm_lang$core$List$filter,
			_fifth_postulate$trade_card$TradeCard_Collection$negate(
				_fifth_postulate$trade_card$TradeCard_Collection$isCollected(collection)),
			A2(_elm_lang$core$Basics$uncurry, _elm_lang$core$List$range, collection.range)));
};
var _fifth_postulate$trade_card$TradeCard_Collection$doubles = function (collection) {
	return A2(
		_elm_lang$core$List$map,
		function (t) {
			return {
				ctor: '_Tuple2',
				_0: _elm_lang$core$Tuple$first(t),
				_1: _elm_lang$core$Tuple$second(t) - 1
			};
		},
		A2(
			_elm_lang$core$List$filter,
			function (t) {
				return _elm_lang$core$Native_Utils.cmp(
					_elm_lang$core$Tuple$second(t),
					1) > 0;
			},
			_elm_lang$core$Dict$values(collection.collected)));
};
var _fifth_postulate$trade_card$TradeCard_Collection$collected = function (collection) {
	return A2(
		_elm_lang$core$List$map,
		_elm_lang$core$Tuple$first,
		_elm_lang$core$Dict$values(collection.collected));
};
var _fifth_postulate$trade_card$TradeCard_Collection$remove = F2(
	function (card, collection) {
		var _p0 = A2(_elm_lang$core$Dict$get, card.id, collection.collected);
		if (_p0.ctor === 'Just') {
			var _p2 = _p0._0._1;
			var _p1 = _p0._0._0;
			var newlyCollected = (_elm_lang$core$Native_Utils.cmp(_p2, 1) > 0) ? A3(
				_elm_lang$core$Dict$insert,
				_p1.id,
				{ctor: '_Tuple2', _0: _p1, _1: _p2 - 1},
				collection.collected) : A2(_elm_lang$core$Dict$remove, _p1.id, collection.collected);
			return _elm_lang$core$Native_Utils.update(
				collection,
				{collected: newlyCollected});
		} else {
			return collection;
		}
	});
var _fifth_postulate$trade_card$TradeCard_Collection$empty = F2(
	function (low, high) {
		return {
			range: {
				ctor: '_Tuple2',
				_0: A2(_elm_lang$core$Basics$min, low, high),
				_1: A2(_elm_lang$core$Basics$max, low, high)
			},
			collected: _elm_lang$core$Dict$empty
		};
	});
var _fifth_postulate$trade_card$TradeCard_Collection$Collection = F2(
	function (a, b) {
		return {range: a, collected: b};
	});
var _fifth_postulate$trade_card$TradeCard_Collection$OutsideRange = F2(
	function (a, b) {
		return {ctor: 'OutsideRange', _0: a, _1: b};
	});
var _fifth_postulate$trade_card$TradeCard_Collection$collect = F2(
	function (card, collection) {
		var range = collection.range;
		var id = card.id;
		var idInRange = (_elm_lang$core$Native_Utils.cmp(
			_elm_lang$core$Tuple$first(range),
			id) < 1) && (_elm_lang$core$Native_Utils.cmp(
			id,
			_elm_lang$core$Tuple$second(range)) < 1);
		if (idInRange) {
			var _p3 = A2(_elm_lang$core$Dict$get, id, collection.collected);
			if (_p3.ctor === 'Just') {
				var newlyCollected = A3(
					_elm_lang$core$Dict$insert,
					id,
					{ctor: '_Tuple2', _0: _p3._0._0, _1: _p3._0._1 + 1},
					collection.collected);
				return _elm_lang$core$Result$Ok(
					_elm_lang$core$Native_Utils.update(
						collection,
						{collected: newlyCollected}));
			} else {
				var newlyCollected = A3(
					_elm_lang$core$Dict$insert,
					id,
					{ctor: '_Tuple2', _0: card, _1: 1},
					collection.collected);
				return _elm_lang$core$Result$Ok(
					_elm_lang$core$Native_Utils.update(
						collection,
						{collected: newlyCollected}));
			}
		} else {
			return _elm_lang$core$Result$Err(
				A2(_fifth_postulate$trade_card$TradeCard_Collection$OutsideRange, range, id));
		}
	});

var _fifth_postulate$trade_card$TradeCard_View$doublicityView = F2(
	function (message, _p0) {
		var _p1 = _p0;
		return A2(
			_elm_lang$html$Html$div,
			{ctor: '[]'},
			{
				ctor: '::',
				_0: A2(_fifth_postulate$trade_card$TradeCard_Card$view, message, _p1._0),
				_1: {
					ctor: '::',
					_0: A2(
						_elm_lang$html$Html$span,
						{
							ctor: '::',
							_0: _elm_lang$html$Html_Attributes$class('duplicity'),
							_1: {ctor: '[]'}
						},
						{
							ctor: '::',
							_0: _elm_lang$html$Html$text(
								_elm_lang$core$Basics$toString(_p1._1)),
							_1: {ctor: '[]'}
						}),
					_1: {ctor: '[]'}
				}
			});
	});
var _fifth_postulate$trade_card$TradeCard_View$duplicityList = F2(
	function (message, doubles) {
		return A2(
			_elm_lang$html$Html$div,
			{
				ctor: '::',
				_0: _elm_lang$html$Html_Attributes$class('card duplicity list'),
				_1: {ctor: '[]'}
			},
			A2(
				_elm_lang$core$List$map,
				_fifth_postulate$trade_card$TradeCard_View$doublicityView(message),
				doubles));
	});
var _fifth_postulate$trade_card$TradeCard_View$viewCard = F3(
	function (primary, secondary, card) {
		var element = function () {
			var _p2 = secondary;
			if (_p2.ctor === 'Just') {
				return A2(
					_elm_lang$html$Html$span,
					{
						ctor: '::',
						_0: _elm_lang$html$Html_Attributes$class('lose'),
						_1: {
							ctor: '::',
							_0: _elm_lang$html$Html_Events$onClick(
								_p2._0(card)),
							_1: {ctor: '[]'}
						}
					},
					{
						ctor: '::',
						_0: _elm_lang$html$Html$text('x'),
						_1: {ctor: '[]'}
					});
			} else {
				return A2(
					_elm_lang$html$Html$span,
					{ctor: '[]'},
					{ctor: '[]'});
			}
		}();
		return A2(
			_elm_lang$html$Html$div,
			{ctor: '[]'},
			{
				ctor: '::',
				_0: element,
				_1: {
					ctor: '::',
					_0: A2(_fifth_postulate$trade_card$TradeCard_Card$view, primary, card),
					_1: {ctor: '[]'}
				}
			});
	});
var _fifth_postulate$trade_card$TradeCard_View$viewCardList = F3(
	function (primary, secondary, cards) {
		return A2(
			_elm_lang$html$Html$div,
			{
				ctor: '::',
				_0: _elm_lang$html$Html_Attributes$class('card list'),
				_1: {ctor: '[]'}
			},
			A2(
				_elm_lang$core$List$map,
				A2(_fifth_postulate$trade_card$TradeCard_View$viewCard, primary, secondary),
				cards));
	});
var _fifth_postulate$trade_card$TradeCard_View$collectionView = F6(
	function (target, collectedMessage, lostMessage, doubleMessage, missingMessage, collection) {
		var targetId = _elm_lang$core$Result$toMaybe(
			_elm_lang$core$String$toInt(target));
		var predicate = function (card) {
			var _p3 = targetId;
			if (_p3.ctor === 'Just') {
				return _elm_lang$core$Native_Utils.eq(card.id, _p3._0);
			} else {
				return true;
			}
		};
		var filter = _elm_lang$core$List$filter(predicate);
		var filterOnFirst = function () {
			var predicateOnFirst = function (_p4) {
				var _p5 = _p4;
				return predicate(_p5._0);
			};
			return _elm_lang$core$List$filter(predicateOnFirst);
		}();
		return A2(
			_elm_lang$html$Html$div,
			{
				ctor: '::',
				_0: _elm_lang$html$Html_Attributes$class('card collection'),
				_1: {ctor: '[]'}
			},
			{
				ctor: '::',
				_0: A3(
					_fifth_postulate$trade_card$TradeCard_View$viewCardList,
					collectedMessage,
					lostMessage,
					filter(
						_fifth_postulate$trade_card$TradeCard_Collection$collected(collection))),
				_1: {
					ctor: '::',
					_0: A2(
						_fifth_postulate$trade_card$TradeCard_View$duplicityList,
						doubleMessage,
						filterOnFirst(
							_fifth_postulate$trade_card$TradeCard_Collection$doubles(collection))),
					_1: {
						ctor: '::',
						_0: A3(
							_fifth_postulate$trade_card$TradeCard_View$viewCardList,
							missingMessage,
							_elm_lang$core$Maybe$Nothing,
							filter(
								_fifth_postulate$trade_card$TradeCard_Collection$missing(collection))),
						_1: {ctor: '[]'}
					}
				}
			});
	});

// PouchDB 5.4.4
// 
// (c) 2012-2016 Dale Harvey and the PouchDB team
// PouchDB may be freely distributed under the Apache license, version 2.0.
// For all details and documentation:
// http://pouchdb.com
!function(e){if("object"==typeof exports&&"undefined"!=typeof module)module.exports=e();else if("function"==typeof define&&define.amd)define([],e);else{var t;t="undefined"!=typeof window?window:"undefined"!=typeof global?global:"undefined"!=typeof self?self:this,t.PouchDB=e()}}(function(){var e;return function t(e,n,r){function o(a,s){if(!n[a]){if(!e[a]){var u="function"==typeof require&&require;if(!s&&u)return u(a,!0);if(i)return i(a,!0);var c=new Error("Cannot find module '"+a+"'");throw c.code="MODULE_NOT_FOUND",c}var f=n[a]={exports:{}};e[a][0].call(f.exports,function(t){var n=e[a][1][t];return o(n?n:t)},f,f.exports,t,e,n,r)}return n[a].exports}for(var i="function"==typeof require&&require,a=0;a<r.length;a++)o(r[a]);return o}({1:[function(e,t,n){function r(){this._events=this._events||{},this._maxListeners=this._maxListeners||void 0}function o(e){return"function"==typeof e}function i(e){return"number"==typeof e}function a(e){return"object"==typeof e&&null!==e}function s(e){return void 0===e}t.exports=r,r.EventEmitter=r,r.prototype._events=void 0,r.prototype._maxListeners=void 0,r.defaultMaxListeners=10,r.prototype.setMaxListeners=function(e){if(!i(e)||0>e||isNaN(e))throw TypeError("n must be a positive number");return this._maxListeners=e,this},r.prototype.emit=function(e){var t,n,r,i,u,c;if(this._events||(this._events={}),"error"===e&&(!this._events.error||a(this._events.error)&&!this._events.error.length)){if(t=arguments[1],t instanceof Error)throw t;throw TypeError('Uncaught, unspecified "error" event.')}if(n=this._events[e],s(n))return!1;if(o(n))switch(arguments.length){case 1:n.call(this);break;case 2:n.call(this,arguments[1]);break;case 3:n.call(this,arguments[1],arguments[2]);break;default:i=Array.prototype.slice.call(arguments,1),n.apply(this,i)}else if(a(n))for(i=Array.prototype.slice.call(arguments,1),c=n.slice(),r=c.length,u=0;r>u;u++)c[u].apply(this,i);return!0},r.prototype.addListener=function(e,t){var n;if(!o(t))throw TypeError("listener must be a function");return this._events||(this._events={}),this._events.newListener&&this.emit("newListener",e,o(t.listener)?t.listener:t),this._events[e]?a(this._events[e])?this._events[e].push(t):this._events[e]=[this._events[e],t]:this._events[e]=t,a(this._events[e])&&!this._events[e].warned&&(n=s(this._maxListeners)?r.defaultMaxListeners:this._maxListeners,n&&n>0&&this._events[e].length>n&&(this._events[e].warned=!0,console.error("(node) warning: possible EventEmitter memory leak detected. %d listeners added. Use emitter.setMaxListeners() to increase limit.",this._events[e].length),"function"==typeof console.trace&&console.trace())),this},r.prototype.on=r.prototype.addListener,r.prototype.once=function(e,t){function n(){this.removeListener(e,n),r||(r=!0,t.apply(this,arguments))}if(!o(t))throw TypeError("listener must be a function");var r=!1;return n.listener=t,this.on(e,n),this},r.prototype.removeListener=function(e,t){var n,r,i,s;if(!o(t))throw TypeError("listener must be a function");if(!this._events||!this._events[e])return this;if(n=this._events[e],i=n.length,r=-1,n===t||o(n.listener)&&n.listener===t)delete this._events[e],this._events.removeListener&&this.emit("removeListener",e,t);else if(a(n)){for(s=i;s-- >0;)if(n[s]===t||n[s].listener&&n[s].listener===t){r=s;break}if(0>r)return this;1===n.length?(n.length=0,delete this._events[e]):n.splice(r,1),this._events.removeListener&&this.emit("removeListener",e,t)}return this},r.prototype.removeAllListeners=function(e){var t,n;if(!this._events)return this;if(!this._events.removeListener)return 0===arguments.length?this._events={}:this._events[e]&&delete this._events[e],this;if(0===arguments.length){for(t in this._events)"removeListener"!==t&&this.removeAllListeners(t);return this.removeAllListeners("removeListener"),this._events={},this}if(n=this._events[e],o(n))this.removeListener(e,n);else if(n)for(;n.length;)this.removeListener(e,n[n.length-1]);return delete this._events[e],this},r.prototype.listeners=function(e){var t;return t=this._events&&this._events[e]?o(this._events[e])?[this._events[e]]:this._events[e].slice():[]},r.prototype.listenerCount=function(e){if(this._events){var t=this._events[e];if(o(t))return 1;if(t)return t.length}return 0},r.listenerCount=function(e,t){return e.listenerCount(t)}},{}],2:[function(e,t,n){function r(){d&&f&&(d=!1,f.length?l=f.concat(l):h=-1,l.length&&o())}function o(){if(!d){var e=s(r);d=!0;for(var t=l.length;t;){for(f=l,l=[];++h<t;)f&&f[h].run();h=-1,t=l.length}f=null,d=!1,u(e)}}function i(e,t){this.fun=e,this.array=t}function a(){}var s,u,c=t.exports={};!function(){try{s=setTimeout}catch(e){s=function(){throw new Error("setTimeout is not defined")}}try{u=clearTimeout}catch(e){u=function(){throw new Error("clearTimeout is not defined")}}}();var f,l=[],d=!1,h=-1;c.nextTick=function(e){var t=new Array(arguments.length-1);if(arguments.length>1)for(var n=1;n<arguments.length;n++)t[n-1]=arguments[n];l.push(new i(e,t)),1!==l.length||d||s(o,0)},i.prototype.run=function(){this.fun.apply(null,this.array)},c.title="browser",c.browser=!0,c.env={},c.argv=[],c.version="",c.versions={},c.on=a,c.addListener=a,c.once=a,c.off=a,c.removeListener=a,c.removeAllListeners=a,c.emit=a,c.binding=function(e){throw new Error("process.binding is not supported")},c.cwd=function(){return"/"},c.chdir=function(e){throw new Error("process.chdir is not supported")},c.umask=function(){return 0}},{}],3:[function(e,t,n){(function(n,r){"use strict";function o(e){return e&&"object"==typeof e&&"default"in e?e["default"]:e}function i(e){return e instanceof ArrayBuffer||"undefined"!=typeof Blob&&e instanceof Blob}function a(e){if("function"==typeof e.slice)return e.slice(0);var t=new ArrayBuffer(e.byteLength),n=new Uint8Array(t),r=new Uint8Array(e);return n.set(r),t}function s(e){if(e instanceof ArrayBuffer)return a(e);var t=e.size,n=e.type;return"function"==typeof e.slice?e.slice(0,t,n):e.webkitSlice(0,t,n)}function u(e){var t=Object.getPrototypeOf(e);if(null===t)return!0;var n=t.constructor;return"function"==typeof n&&n instanceof n&&xr.call(n)==Ar}function c(e){var t,n,r;if(!e||"object"!=typeof e)return e;if(Array.isArray(e)){for(t=[],n=0,r=e.length;r>n;n++)t[n]=c(e[n]);return t}if(e instanceof Date)return e.toISOString();if(i(e))return s(e);if(!u(e))return e;t={};for(n in e)if(Object.prototype.hasOwnProperty.call(e,n)){var o=c(e[n]);"undefined"!=typeof o&&(t[n]=o)}return t}function f(e){var t=!1;return gr(function(n){if(t)throw new Error("once called more than once");t=!0,e.apply(this,n)})}function l(e){return gr(function(t){t=c(t);var r,o=this,i="function"==typeof t[t.length-1]?t.pop():!1;i&&(r=function(e,t){n.nextTick(function(){i(e,t)})});var a=new qr(function(n,r){var i;try{var a=f(function(e,t){e?r(e):n(t)});t.push(a),i=e.apply(o,t),i&&"function"==typeof i.then&&n(i)}catch(s){r(s)}});return r&&a.then(function(e){r(null,e)},r),a})}function d(e,t){function n(e,t,n){if(Tr.enabled){for(var r=[e._db_name,t],o=0;o<n.length-1;o++)r.push(n[o]);Tr.apply(null,r);var i=n[n.length-1];n[n.length-1]=function(n,r){var o=[e._db_name,t];o=o.concat(n?["error",n]:["success",r]),Tr.apply(null,o),i(n,r)}}}return l(gr(function(r){if(this._closed)return qr.reject(new Error("database is closed"));if(this._destroyed)return qr.reject(new Error("database is destroyed"));var o=this;return n(o,e,r),this.taskqueue.isReady?t.apply(this,r):new qr(function(t,n){o.taskqueue.addTask(function(i){i?n(i):t(o[e].apply(o,r))})})}))}function h(e,t){for(var n={},r=0,o=t.length;o>r;r++){var i=t[r];i in e&&(n[i]=e[i])}return n}function p(e){return e}function v(e){return[{ok:e}]}function y(e,t,n){function r(){var e=[];d.forEach(function(t){t.docs.forEach(function(n){e.push({id:t.id,docs:[n]})})}),n(null,{results:e})}function o(){++l===f&&r()}function i(e,t,n){d[e]={id:t,docs:n},o()}function a(){if(!(_>=y.length)){var e=Math.min(_+Or,y.length),t=y.slice(_,e);s(t,_),_+=t.length}}function s(n,r){n.forEach(function(n,o){var s=r+o,u=c[n],f=h(u[0],["atts_since","attachments"]);f.open_revs=u.map(function(e){return e.rev}),f.open_revs=f.open_revs.filter(p);var l=p;0===f.open_revs.length&&(delete f.open_revs,l=v),["revs","attachments","binary","ajax"].forEach(function(e){e in t&&(f[e]=t[e])}),e.get(n,f,function(e,t){var r;r=e?[{error:e}]:l(t),i(s,n,r),a()})})}var u=t.docs,c={};u.forEach(function(e){e.id in c?c[e.id].push(e):c[e.id]=[e]});var f=Object.keys(c).length,l=0,d=new Array(f),y=Object.keys(c),_=0;a()}function _(){return"undefined"!=typeof chrome&&"undefined"!=typeof chrome.storage&&"undefined"!=typeof chrome.storage.local}function m(){return hr}function g(e){_()?chrome.storage.onChanged.addListener(function(t){null!=t.db_name&&e.emit(t.dbName.newValue)}):m()&&("undefined"!=typeof addEventListener?addEventListener("storage",function(t){e.emit(t.key)}):window.attachEvent("storage",function(t){e.emit(t.key)}))}function b(){br.EventEmitter.call(this),this._listeners={},g(this)}function w(e){if("undefined"!==console&&e in console){var t=Array.prototype.slice.call(arguments,1);console[e].apply(console,t)}}function E(e,t){var n=6e5;e=parseInt(e,10)||0,t=parseInt(t,10),t!==t||e>=t?t=(e||1)<<1:t+=1,t>n&&(e=n>>1,t=n);var r=Math.random(),o=t-e;return~~(o*r+e)}function S(e){var t=0;return e||(t=2e3),E(e,t)}function k(e,t){w("info","The above "+e+" is totally normal. "+t)}function q(e){Error.call(this,e.reason),this.status=e.status,this.name=e.error,this.message=e.reason,this.error=!0}function x(e,t,n){function r(t){for(var r in e)"function"!=typeof e[r]&&(this[r]=e[r]);void 0!==n&&(this.name=n),void 0!==t&&(this.reason=t)}return r.prototype=q.prototype,new r(t)}function A(e){var t,n,r,o,i;return n=e.error===!0&&"string"==typeof e.name?e.name:e.error,i=e.reason,r=no("name",n,i),e.missing||"missing"===i||"deleted"===i||"not_found"===n?r=Ir:"doc_validation"===n?(r=Kr,o=i):"bad_request"===n&&r.message!==i&&(r=Jr),r||(r=no("status",e.status,i)||Fr),t=x(r,i,n),o&&(t.message=o),e.id&&(t.id=e.id),e.status&&(t.status=e.status),e.missing&&(t.missing=e.missing),t}function T(e,t,n){try{return!e(t,n)}catch(r){var o="Filter function threw: "+r.toString();return x(Jr,o)}}function O(e){var t={},n=e.filter&&"function"==typeof e.filter;return t.query=e.query_params,function(r){r.doc||(r.doc={});var o=n&&T(e.filter,r.doc,t);if("object"==typeof o)return o;if(o)return!1;if(e.include_docs){if(!e.attachments)for(var i in r.doc._attachments)r.doc._attachments.hasOwnProperty(i)&&(r.doc._attachments[i].stub=!0)}else delete r.doc;return!0}}function j(e){for(var t=[],n=0,r=e.length;r>n;n++)t=t.concat(e[n]);return t}function C(e){var t;if(e?"string"!=typeof e?t=x(Rr):/^_/.test(e)&&!/^_(design|local)/.test(e)&&(t=x(Br)):t=x(Nr),t)throw t}function L(e,t){return"listenerCount"in e?e.listenerCount(t):br.EventEmitter.listenerCount(e,t)}function I(e){if(!e)return null;var t=e.split("/");return 2===t.length?t:1===t.length?[e,e]:null}function D(e){var t=I(e);return t?t.join("/"):null}function R(e){for(var t=ao.exec(e),n={},r=14;r--;){var o=ro[r],i=t[r]||"",a=-1!==["user","password"].indexOf(o);n[o]=a?decodeURIComponent(i):i}return n[oo]={},n[ro[12]].replace(io,function(e,t,r){t&&(n[oo][t]=r)}),n}function N(e,t,n){return new qr(function(r,o){e.get(t,function(i,a){if(i){if(404!==i.status)return o(i);a={}}var s=a._rev,u=n(a);return u?(u._id=t,u._rev=s,void r(B(e,u,n))):r({updated:!1,rev:s})})})}function B(e,t,n){return e.put(t).then(function(e){return{updated:!0,rev:e.rev}},function(r){if(409!==r.status)throw r;return N(e,t._id,n)})}function M(e){return 0|Math.random()*e}function F(e,t){t=t||so.length;var n="",r=-1;if(e){for(;++r<e;)n+=so[M(t)];return n}for(;++r<36;)switch(r){case 8:case 13:case 18:case 23:n+="-";break;case 19:n+=so[3&M(16)|8];break;default:n+=so[M(16)]}return n}function U(e){for(var t,n,r,o,i=e.rev_tree.slice();o=i.pop();){var a=o.ids,s=a[2],u=o.pos;if(s.length)for(var c=0,f=s.length;f>c;c++)i.push({pos:u+1,ids:s[c]});else{var l=!!a[1].deleted,d=a[0];t&&!(r!==l?r:n!==u?u>n:d>t)||(t=d,n=u,r=l)}}return n+"-"+t}function P(e,t){for(var n,r=e.slice();n=r.pop();)for(var o=n.pos,i=n.ids,a=i[2],s=t(0===a.length,o,i[0],n.ctx,i[1]),u=0,c=a.length;c>u;u++)r.push({pos:o+1,ids:a[u],ctx:s})}function H(e,t){return e.pos-t.pos}function K(e){var t=[];P(e,function(e,n,r,o,i){e&&t.push({rev:n+"-"+r,pos:n,opts:i})}),t.sort(H).reverse();for(var n=0,r=t.length;r>n;n++)delete t[n].pos;return t}function J(e){for(var t=U(e),n=K(e.rev_tree),r=[],o=0,i=n.length;i>o;o++){var a=n[o];a.rev===t||a.opts.deleted||r.push(a.rev)}return r}function W(e){var t=[];return P(e.rev_tree,function(e,n,r,o,i){"available"!==i.status||e||(t.push(n+"-"+r),i.status="missing")}),t}function z(e){for(var t,n=[],r=e.slice();t=r.pop();){var o=t.pos,i=t.ids,a=i[0],s=i[1],u=i[2],c=0===u.length,f=t.history?t.history.slice():[];f.push({id:a,opts:s}),c&&n.push({pos:o+1-f.length,ids:f});for(var l=0,d=u.length;d>l;l++)r.push({pos:o+1,ids:u[l],history:f})}return n.reverse()}function X(e,t){return e.pos-t.pos}function G(e,t,n){for(var r,o=0,i=e.length;i>o;)r=o+i>>>1,n(e[r],t)<0?o=r+1:i=r;return o}function V(e,t,n){var r=G(e,t,n);e.splice(r,0,t)}function Q(e,t){for(var n,r,o=t,i=e.length;i>o;o++){var a=e[o],s=[a.id,a.opts,[]];r?(r[2].push(s),r=s):n=r=s}return n}function $(e,t){return e[0]<t[0]?-1:1}function Y(e,t){for(var n=[{tree1:e,tree2:t}],r=!1;n.length>0;){var o=n.pop(),i=o.tree1,a=o.tree2;(i[1].status||a[1].status)&&(i[1].status="available"===i[1].status||"available"===a[1].status?"available":"missing");for(var s=0;s<a[2].length;s++)if(i[2][0]){for(var u=!1,c=0;c<i[2].length;c++)i[2][c][0]===a[2][s][0]&&(n.push({tree1:i[2][c],tree2:a[2][s]}),u=!0);u||(r="new_branch",V(i[2],a[2][s],$))}else r="new_leaf",i[2][0]=a[2][s]}return{conflicts:r,tree:e}}function Z(e,t,n){var r,o=[],i=!1,a=!1;if(!e.length)return{tree:[t],conflicts:"new_leaf"};for(var s=0,u=e.length;u>s;s++){var c=e[s];if(c.pos===t.pos&&c.ids[0]===t.ids[0])r=Y(c.ids,t.ids),o.push({pos:c.pos,ids:r.tree}),i=i||r.conflicts,a=!0;else if(n!==!0){var f=c.pos<t.pos?c:t,l=c.pos<t.pos?t:c,d=l.pos-f.pos,h=[],p=[];for(p.push({ids:f.ids,diff:d,parent:null,parentIdx:null});p.length>0;){var v=p.pop();if(0!==v.diff)for(var y=v.ids[2],_=0,m=y.length;m>_;_++)p.push({ids:y[_],diff:v.diff-1,parent:v.ids,parentIdx:_});else v.ids[0]===l.ids[0]&&h.push(v)}var g=h[0];g?(r=Y(g.ids,l.ids),g.parent[2][g.parentIdx]=r.tree,o.push({pos:f.pos,ids:f.ids}),i=i||r.conflicts,a=!0):o.push(c)}else o.push(c)}return a||o.push(t),o.sort(X),{tree:o,conflicts:i||"internal_node"}}function ee(e,t){for(var n,r=z(e),o={},i=0,a=r.length;a>i;i++){for(var s=r[i],u=s.ids,c=Math.max(0,u.length-t),f={pos:s.pos+c,ids:Q(u,c)},l=0;c>l;l++){var d=s.pos+l+"-"+u[l].id;o[d]=!0}n=n?Z(n,f,!0).tree:[f]}return P(n,function(e,t,n){delete o[t+"-"+n]}),{tree:n,revs:Object.keys(o)}}function te(e,t,n){var r=Z(e,t),o=ee(r.tree,n);return{tree:o.tree,stemmedRevs:o.revs,conflicts:r.conflicts}}function ne(e,t){for(var n,r=e.slice(),o=t.split("-"),i=parseInt(o[0],10),a=o[1];n=r.pop();){if(n.pos===i&&n.ids[0]===a)return!0;for(var s=n.ids[2],u=0,c=s.length;c>u;u++)r.push({pos:n.pos+1,ids:s[u]})}return!1}function re(e){return e.ids}function oe(e,t){t||(t=U(e));for(var n,r=t.substring(t.indexOf("-")+1),o=e.rev_tree.map(re);n=o.pop();){if(n[0]===r)return!!n[1].deleted;o=o.concat(n[2])}}function ie(e){return/^_local/.test(e)}function ae(e){return wr("return "+e+";",{})}function se(e){return new Function("doc",["var emitted = false;","var emit = function (a, b) {","  emitted = true;","};","var view = "+e+";","view(doc);","if (emitted) {","  return true;","}"].join("\n"))}function ue(e,t){try{e.emit("change",t)}catch(n){w("error",'Error in .on("change", function):',n)}}function ce(e,t,n){function r(){o.cancel()}br.EventEmitter.call(this);var o=this;this.db=e,t=t?c(t):{};var i=t.complete=f(function(t,n){t?L(o,"error")>0&&o.emit("error",t):o.emit("complete",n),o.removeAllListeners(),e.removeListener("destroyed",r)});n&&(o.on("complete",function(e){n(null,e)}),o.on("error",n)),e.once("destroyed",r),t.onChange=function(e){t.isCancelled||(ue(o,e),o.startSeq&&o.startSeq<=e.seq&&(o.startSeq=!1))};var a=new qr(function(e,n){t.complete=function(t,r){t?n(t):e(r)}});o.once("cancel",function(){e.removeListener("destroyed",r),t.complete(null,{status:"cancelled"})}),this.then=a.then.bind(a),this["catch"]=a["catch"].bind(a),this.then(function(e){i(null,e)},i),e.taskqueue.isReady?o.doChanges(t):e.taskqueue.addTask(function(){o.isCancelled?o.emit("cancel"):o.doChanges(t)})}function fe(e,t,n){var r=[{rev:e._rev}];"all_docs"===n.style&&(r=K(t.rev_tree).map(function(e){return{rev:e.rev}}));var o={id:t.id,changes:r,doc:e};return oe(t,e._rev)&&(o.deleted=!0),n.conflicts&&(o.doc._conflicts=J(t),o.doc._conflicts.length||delete o.doc._conflicts),o}function le(e,t){return t>e?-1:e>t?1:0}function de(e,t){for(var n=0;n<e.length;n++)if(t(e[n],n)===!0)return e[n]}function he(e){return function(t,n){t||n[0]&&n[0].error?e(t||n[0]):e(null,n.length?n[0]:n)}}function pe(e){for(var t=0;t<e.length;t++){var n=e[t];if(n._deleted)delete n._attachments;else if(n._attachments)for(var r=Object.keys(n._attachments),o=0;o<r.length;o++){var i=r[o];n._attachments[i]=h(n._attachments[i],["data","digest","content_type","length","revpos","stub"])}}}function ve(e,t){var n=le(e._id,t._id);if(0!==n)return n;var r=e._revisions?e._revisions.start:0,o=t._revisions?t._revisions.start:0;return le(r,o)}function ye(e){var t={},n=[];return P(e,function(e,r,o,i){var a=r+"-"+o;return e&&(t[a]=0),void 0!==i&&n.push({from:i,to:a}),a}),n.reverse(),n.forEach(function(e){void 0===t[e.from]?t[e.from]=1+t[e.to]:t[e.from]=Math.min(t[e.from],1+t[e.to])}),t}function _e(e,t,n){var r="limit"in t?t.keys.slice(t.skip,t.limit+t.skip):t.skip>0?t.keys.slice(t.skip):t.keys;if(t.descending&&r.reverse(),!r.length)return e._allDocs({limit:0},n);var o={offset:t.skip};return qr.all(r.map(function(n){var r=pr.extend({key:n,deleted:"ok"},t);return["limit","skip","keys"].forEach(function(e){delete r[e]}),new qr(function(t,i){e._allDocs(r,function(e,r){return e?i(e):(o.total_rows=r.total_rows,void t(r.rows[0]||{key:n,error:"not_found"}))})})})).then(function(e){return o.rows=e,o})}function me(e){var t=e._compactionQueue[0],r=t.opts,o=t.callback;e.get("_local/compaction")["catch"](function(){return!1}).then(function(t){t&&t.last_seq&&(r.last_seq=t.last_seq),e._compact(r,function(t,r){t?o(t):o(null,r),n.nextTick(function(){e._compactionQueue.shift(),e._compactionQueue.length&&me(e)})})})}function ge(e){return"_"===e.charAt(0)?e+"is not a valid attachment name, attachment names cannot start with '_'":!1}function be(){br.EventEmitter.call(this)}function we(){this.isReady=!1,this.failed=!1,this.queue=[]}function Ee(e){e&&r.debug&&w("error",e)}function Se(e,t){function n(){i.emit("destroyed",o)}function r(){e.removeListener("destroyed",n),e.emit("destroyed",e)}var o=t.originalName,i=e.constructor,a=i._destructionListeners;e.once("destroyed",n),a.has(o)||a.set(o,[]),a.get(o).push(r)}function ke(e,t,n){if(!(this instanceof ke))return new ke(e,t,n);var r=this;if("function"!=typeof t&&"undefined"!=typeof t||(n=t,t={}),e&&"object"==typeof e&&(t=e,e=void 0),"undefined"==typeof n)n=Ee;else{var o=n;n=function(){return w("warn","Using a callback for new PouchDB()is deprecated."),o.apply(null,arguments)}}e=e||t.name,t=c(t),delete t.name,this.__opts=t;var i=n;r.auto_compaction=t.auto_compaction,r.prefix=ke.prefix,be.call(r),r.taskqueue=new we;var a=new qr(function(o,i){n=function(e,t){return e?i(e):(delete t.then,void o(t))},t=c(t);var a,s;return function(){try{if("string"!=typeof e)throw s=new Error("Missing/invalid DB name"),s.code=400,s;var n=(t.prefix||"")+e;if(a=ke.parseAdapter(n,t),t.originalName=e,t.name=a.name,t.adapter=t.adapter||a.adapter,r._adapter=t.adapter,vr("pouchdb:adapter")("Picked adapter: "+t.adapter),r._db_name=e,!ke.adapters[t.adapter])throw s=new Error("Adapter is missing"),s.code=404,s;if(!ke.adapters[t.adapter].valid())throw s=new Error("Invalid Adapter"),s.code=404,s}catch(o){r.taskqueue.fail(o)}}(),s?i(s):(r.adapter=t.adapter,r.replicate={},r.replicate.from=function(e,t,n){return r.constructor.replicate(e,r,t,n)},r.replicate.to=function(e,t,n){return r.constructor.replicate(r,e,t,n)},r.sync=function(e,t,n){return r.constructor.sync(r,e,t,n)},r.replicate.sync=r.sync,void ke.adapters[t.adapter].call(r,t,function(e){return e?(r.taskqueue.fail(e),void n(e)):(Se(r,t),r.emit("created",r),ke.emit("created",t.originalName),r.taskqueue.ready(r),void n(null,r))}))});a.then(function(e){i(null,e)},i),r.then=a.then.bind(a),r["catch"]=a["catch"].bind(a)}function qe(e){Object.keys(br.EventEmitter.prototype).forEach(function(t){"function"==typeof br.EventEmitter.prototype[t]&&(e[t]=uo[t].bind(uo))});var t=e._destructionListeners=new mr.Map;e.on("destroyed",function(e){t.get(e).forEach(function(e){e()}),t["delete"](e)})}function xe(e){return e.reduce(function(e,t){return e[t]=!0,e},{})}function Ae(e){if(!/^\d+\-./.test(e))return x($r);var t=e.indexOf("-"),n=e.substring(0,t),r=e.substring(t+1);return{prefix:parseInt(n,10),id:r}}function Te(e,t){for(var n=e.start-e.ids.length+1,r=e.ids,o=[r[0],t,[]],i=1,a=r.length;a>i;i++)o=[r[i],{status:"missing"},[o]];return[{pos:n,ids:o}]}function Oe(e,t){var n,r,o,i={status:"available"};if(e._deleted&&(i.deleted=!0),t)if(e._id||(e._id=F()),r=F(32,16).toLowerCase(),e._rev){if(o=Ae(e._rev),o.error)return o;e._rev_tree=[{pos:o.prefix,ids:[o.id,{status:"missing"},[[r,i,[]]]]}],n=o.prefix+1}else e._rev_tree=[{pos:1,ids:[r,i,[]]}],n=1;else if(e._revisions&&(e._rev_tree=Te(e._revisions,i),n=e._revisions.start,r=e._revisions.ids[0]),!e._rev_tree){if(o=Ae(e._rev),o.error)return o;n=o.prefix,r=o.id,e._rev_tree=[{pos:n,ids:[r,i,[]]}]}C(e._id),e._rev=n+"-"+r;var a={metadata:{},data:{}};for(var s in e)if(Object.prototype.hasOwnProperty.call(e,s)){var u="_"===s[0];if(u&&!lo[s]){var c=x(Kr,s);throw c.message=Kr.message+": "+s,c}u&&!ho[s]?a.metadata[s.slice(1)]=e[s]:a.data[s]=e[s]}return a}function je(e){for(var t="",n=new Uint8Array(e),r=n.byteLength,o=0;r>o;o++)t+=String.fromCharCode(n[o]);return t}function Ce(e){return vo(je(e))}function Le(e,t){e=e||[],t=t||{};try{return new Blob(e,t)}catch(n){if("TypeError"!==n.name)throw n;for(var r="undefined"!=typeof BlobBuilder?BlobBuilder:"undefined"!=typeof MSBlobBuilder?MSBlobBuilder:"undefined"!=typeof MozBlobBuilder?MozBlobBuilder:WebKitBlobBuilder,o=new r,i=0;i<e.length;i+=1)o.append(e[i]);return o.getBlob(t.type)}}function Ie(e){for(var t=e.length,n=new ArrayBuffer(t),r=new Uint8Array(n),o=0;t>o;o++)r[o]=e.charCodeAt(o);return n}function De(e,t){return Le([Ie(e)],{type:t})}function Re(e,t){return De(po(e),t)}function Ne(e,t){if("undefined"==typeof FileReader)return t(je((new FileReaderSync).readAsArrayBuffer(e)));var n=new FileReader,r="function"==typeof n.readAsBinaryString;n.onloadend=function(e){var n=e.target.result||"";return r?t(n):void t(je(n))},r?n.readAsBinaryString(e):n.readAsArrayBuffer(e)}function Be(e,t){Ne(e,function(e){t(vo(e))})}function Me(e,t){if("undefined"==typeof FileReader)return t((new FileReaderSync).readAsArrayBuffer(e));var n=new FileReader;n.onloadend=function(e){var n=e.target.result||new ArrayBuffer(0);t(n)},n.readAsArrayBuffer(e)}function Fe(e){return vo(e)}function Ue(e,t,n,r){(n>0||r<t.byteLength)&&(t=new Uint8Array(t,n,Math.min(r,t.byteLength)-n)),e.append(t)}function Pe(e,t,n,r){(n>0||r<t.length)&&(t=t.substring(n,r)),e.appendBinary(t)}function He(e,t){function n(){var r=s*i,o=r+i;if(s++,a>s)c(u,e,r,o),yo(n);else{c(u,e,r,o);var f=u.end(!0),l=Fe(f);t(l),u.destroy()}}var r="string"==typeof e,o=r?e.length:e.byteLength,i=Math.min(_o,o),a=Math.ceil(o/i),s=0,u=r?new Er:new Er.ArrayBuffer,c=r?Pe:Ue;n()}function Ke(e){return Er.hash(e)}function Je(e,t,n){function r(e){try{return po(e)}catch(t){var n=x(Ur,"Attachment is not a valid base64 string");return{error:n}}}function o(e,n){if(e.stub)return n();if("string"==typeof e.data){var o=r(e.data);if(o.error)return n(o.error);e.length=o.length,"blob"===t?e.data=De(o,e.content_type):"base64"===t?e.data=vo(o):e.data=o,He(o,function(t){e.digest="md5-"+t,n()})}else Me(e.data,function(r){"binary"===t?e.data=je(r):"base64"===t&&(e.data=Ce(r)),He(r,function(t){e.digest="md5-"+t,e.length=r.byteLength,n()})})}function i(){s++,e.length===s&&(a?n(a):n())}if(!e.length)return n();var a,s=0;e.forEach(function(e){function t(e){a=e,r++,r===n.length&&i()}var n=e.data&&e.data._attachments?Object.keys(e.data._attachments):[],r=0;if(!n.length)return i();for(var s in e.data._attachments)e.data._attachments.hasOwnProperty(s)&&o(e.data._attachments[s],t)})}function We(e,t,n,r,o,i,a,s){if(ne(t.rev_tree,n.metadata.rev))return r[o]=n,i();var u=t.winningRev||U(t),c="deleted"in t?t.deleted:oe(t,u),f="deleted"in n.metadata?n.metadata.deleted:oe(n.metadata),l=/^1-/.test(n.metadata.rev);if(c&&!f&&s&&l){var d=n.data;d._rev=u,d._id=n.metadata.id,n=Oe(d,s)}var h=te(t.rev_tree,n.metadata.rev_tree[0],e),p=s&&(c&&f||!c&&"new_leaf"!==h.conflicts||c&&!f&&"new_branch"===h.conflicts);if(p){var v=x(Dr);return r[o]=v,i()}var y=n.metadata.rev;n.metadata.rev_tree=h.tree,n.stemmedRevs=h.stemmedRevs||[],t.rev_map&&(n.metadata.rev_map=t.rev_map);var _,m=U(n.metadata),g=oe(n.metadata,m),b=c===g?0:g>c?-1:1;_=y===m?g:oe(n.metadata,y),a(n,m,g,_,!0,b,o,i)}function ze(e){return"missing"===e.metadata.rev_tree[0].ids[1].status}function Xe(e,t,n,r,o,i,a,s,u){function c(e,t,n){var r=U(e.metadata),o=oe(e.metadata,r);if("was_delete"in s&&o)return i[t]=x(Ir,"deleted"),n();var u=l&&ze(e);if(u){var c=x(Dr);return i[t]=c,n()}var f=o?0:1;a(e,r,o,o,!1,f,t,n)}function f(){++h===p&&u&&u()}e=e||1e3;var l=s.new_edits,d=new mr.Map,h=0,p=t.length;t.forEach(function(e,t){if(e._id&&ie(e._id)){var r=e._deleted?"_removeLocal":"_putLocal";return void n[r](e,{ctx:o},function(e,n){i[t]=e||n,f()})}var a=e.metadata.id;d.has(a)?(p--,d.get(a).push([e,t])):d.set(a,[[e,t]])}),d.forEach(function(t,n){function o(){++u<t.length?s():f()}function s(){var s=t[u],f=s[0],d=s[1];if(r.has(n))We(e,r.get(n),f,i,d,o,a,l);else{var h=te([],f.metadata.rev_tree[0],e);f.metadata.rev_tree=h.tree,f.stemmedRevs=h.stemmedRevs||[],c(f,d,o)}}var u=0;s()})}function Ge(e){try{return JSON.parse(e)}catch(t){return Sr.parse(e)}}function Ve(e){return e.length<5e4?JSON.parse(e):Ge(e)}function Qe(e){try{return JSON.stringify(e)}catch(t){return Sr.stringify(e)}}function $e(e,t,n,r){try{e.apply(t,n)}catch(o){r.emit("error",o)}}function Ye(e){if(!xo.running&&xo.queue.length){xo.running=!0;var t=xo.queue.shift();t.action(function(r,o){$e(t.callback,this,[r,o],e),xo.running=!1,n.nextTick(function(){Ye(e)})})}}function Ze(e){return function(t){var n="unknown_error";t.target&&t.target.error&&(n=t.target.error.name||t.target.error.message),e(x(Xr,n,t.type))}}function et(e,t,n){return{data:Qe(e),winningRev:t,deletedOrLocal:n?"1":"0",seq:e.seq,id:e.id}}function tt(e){if(!e)return null;var t=Ve(e.data);return t.winningRev=e.winningRev,t.deleted="1"===e.deletedOrLocal,t.seq=e.seq,t}function nt(e){if(!e)return e;var t=e._doc_id_rev.lastIndexOf(":");return e._id=e._doc_id_rev.substring(0,t-1),e._rev=e._doc_id_rev.substring(t+1),delete e._doc_id_rev,e}function rt(e,t,n,r){n?r(e?"string"!=typeof e?e:Re(e,t):Le([""],{type:t})):e?"string"!=typeof e?Ne(e,function(e){r(vo(e))}):r(e):r("")}function ot(e,t,n,r){function o(){++s===a.length&&r&&r()}function i(e,t){var r=e._attachments[t],i=r.digest,a=n.objectStore(wo).get(i);a.onsuccess=function(e){r.body=e.target.result.body,o()}}var a=Object.keys(e._attachments||{});if(!a.length)return r&&r();var s=0;a.forEach(function(n){t.attachments&&t.include_docs?i(e,n):(e._attachments[n].stub=!0,o())})}function it(e,t){return qr.all(e.map(function(e){if(e.doc&&e.doc._attachments){var n=Object.keys(e.doc._attachments);return qr.all(n.map(function(n){var r=e.doc._attachments[n];if("body"in r){var o=r.body,i=r.content_type;return new qr(function(a){rt(o,i,t,function(t){e.doc._attachments[n]=pr.extend(h(r,["digest","content_type"]),{data:t}),a()})})}}))}}))}function at(e,t,n){function r(){c--,c||o()}function o(){i.length&&i.forEach(function(e){var t=u.index("digestSeq").count(IDBKeyRange.bound(e+"::",e+"::￿",!1,!1));t.onsuccess=function(t){var n=t.target.result;n||s["delete"](e)}})}var i=[],a=n.objectStore(bo),s=n.objectStore(wo),u=n.objectStore(Eo),c=e.length;e.forEach(function(e){var n=a.index("_doc_id_rev"),o=t+"::"+e;n.getKey(o).onsuccess=function(e){var t=e.target.result;if("number"!=typeof t)return r();a["delete"](t);var n=u.index("seq").openCursor(IDBKeyRange.only(t));n.onsuccess=function(e){var t=e.target.result;if(t){var n=t.value.digestSeq.split("::")[0];i.push(n),u["delete"](t.primaryKey),t["continue"]()}else r()}}})}function st(e,t,n){try{return{txn:e.transaction(t,n)}}catch(r){return{error:r}}}function ut(e,t,n,r,o,i,a){function s(){var e=[go,bo,wo,ko,Eo],t=st(o,e,"readwrite");return t.error?a(t.error):(m=t.txn,m.onabort=Ze(a),m.ontimeout=Ze(a),m.oncomplete=f,g=m.objectStore(go),b=m.objectStore(bo),w=m.objectStore(wo),E=m.objectStore(Eo),void d(function(e){return e?(L=!0,a(e)):void c()}))}function u(){Xe(e.revs_limit,k,r,C,m,j,h,n)}function c(){function e(){++n===k.length&&u()}function t(t){var n=tt(t.target.result);n&&C.set(n.id,n),e()}if(k.length)for(var n=0,r=0,o=k.length;o>r;r++){var i=k[r];if(i._id&&ie(i._id))e();else{var a=g.get(i.metadata.id);a.onsuccess=t}}}function f(){L||(i.notify(r._meta.name),r._meta.docCount+=q,a(null,j))}function l(e,t){var n=w.get(e);n.onsuccess=function(n){if(n.target.result)t();else{var r=x(Zr,"unknown stub attachment with digest "+e);r.status=412,t(r)}}}function d(e){function t(){++o===n.length&&e(r)}var n=[];if(k.forEach(function(e){e.data&&e.data._attachments&&Object.keys(e.data._attachments).forEach(function(t){var r=e.data._attachments[t];r.stub&&n.push(r.digest)})}),!n.length)return e();var r,o=0;n.forEach(function(e){l(e,function(e){e&&!r&&(r=e),t()})})}function h(e,t,n,r,o,i,a,s){q+=i,e.metadata.winningRev=t,e.metadata.deleted=n;var u=e.data;u._id=e.metadata.id,u._rev=e.metadata.rev,r&&(u._deleted=!0);var c=u._attachments&&Object.keys(u._attachments).length;return c?v(e,t,n,o,a,s):void p(e,t,n,o,a,s)}function p(e,t,n,o,i,a){function s(i){var a=e.stemmedRevs||[];o&&r.auto_compaction&&(a=a.concat(W(e.metadata))),a&&a.length&&at(a,e.metadata.id,m),l.seq=i.target.result,delete l.rev;var s=et(l,t,n),u=g.put(s);u.onsuccess=c}function u(e){e.preventDefault(),e.stopPropagation();var t=b.index("_doc_id_rev"),n=t.getKey(f._doc_id_rev);n.onsuccess=function(e){var t=b.put(f,e.target.result);t.onsuccess=s}}function c(){j[i]={ok:!0,id:l.id,rev:t},C.set(e.metadata.id,e.metadata),y(e,l.seq,a)}var f=e.data,l=e.metadata;f._doc_id_rev=l.id+"::"+l.rev,delete f._id,delete f._rev;var d=b.put(f);d.onsuccess=s,d.onerror=u}function v(e,t,n,r,o,i){function a(){c===f.length&&p(e,t,n,r,o,i)}function s(){c++,a()}var u=e.data,c=0,f=Object.keys(u._attachments);f.forEach(function(n){var r=e.data._attachments[n];if(r.stub)c++,a();else{var o=r.data;delete r.data,r.revpos=parseInt(t,10);var i=r.digest;_(i,o,s)}})}function y(e,t,n){function r(){++i===a.length&&n()}function o(n){var o=e.data._attachments[n].digest,i=E.put({seq:t,digestSeq:o+"::"+t});i.onsuccess=r,i.onerror=function(e){e.preventDefault(),e.stopPropagation(),r()}}var i=0,a=Object.keys(e.data._attachments||{});if(!a.length)return n();for(var s=0;s<a.length;s++)o(a[s])}function _(e,t,n){var r=w.count(e);r.onsuccess=function(r){var o=r.target.result;if(o)return n();var i={digest:e,body:t},a=w.put(i);a.onsuccess=n}}for(var m,g,b,w,E,S,k=t.docs,q=0,A=0,T=k.length;T>A;A++){var O=k[A];O._id&&ie(O._id)||(O=k[A]=Oe(O,n.new_edits),O.error&&!S&&(S=O))}if(S)return a(S);var j=new Array(k.length),C=new mr.Map,L=!1,I=r._meta.blobSupport?"blob":"base64";Je(k,I,function(e){return e?a(e):void s()})}function ct(e,t,n,r,o){try{if(e&&t)return o?IDBKeyRange.bound(t,e,!n,!1):IDBKeyRange.bound(e,t,!1,!n);if(e)return o?IDBKeyRange.upperBound(e):IDBKeyRange.lowerBound(e);if(t)return o?IDBKeyRange.lowerBound(t,!n):IDBKeyRange.upperBound(t,!n);if(r)return IDBKeyRange.only(r)}catch(i){return{error:i}}return null}function ft(e,t,n,r){
return"DataError"===n.name&&0===n.code?r(null,{total_rows:e._meta.docCount,offset:t.skip,rows:[]}):void r(x(Xr,n.name,n.message))}function lt(e,t,n,r){function o(e,r){function o(t,n,r){var o=t.id+"::"+r;S.get(o).onsuccess=function(r){n.doc=nt(r.target.result),e.conflicts&&(n.doc._conflicts=J(t)),ot(n.doc,e,g)}}function i(t,n,r){var i={id:r.id,key:r.id,value:{rev:n}},a=r.deleted;if("ok"===e.deleted)k.push(i),a?(i.value.deleted=!0,i.doc=null):e.include_docs&&o(r,i,n);else if(!a&&d--<=0&&(k.push(i),e.include_docs&&o(r,i,n),0===--h))return;t["continue"]()}function a(e){q=t._meta.docCount;var n=e.target.result;if(n){var r=tt(n.value),o=r.winningRev;i(n,o,r)}}function s(){r(null,{total_rows:q,offset:e.skip,rows:k})}function u(){e.attachments?it(k,e.binary).then(s):s()}var c="startkey"in e?e.startkey:!1,f="endkey"in e?e.endkey:!1,l="key"in e?e.key:!1,d=e.skip||0,h="number"==typeof e.limit?e.limit:-1,p=e.inclusive_end!==!1,v="descending"in e&&e.descending?"prev":null,y=ct(c,f,p,l,v);if(y&&y.error)return ft(t,e,y.error,r);var _=[go,bo];e.attachments&&_.push(wo);var m=st(n,_,"readonly");if(m.error)return r(m.error);var g=m.txn,b=g.objectStore(go),w=g.objectStore(bo),E=v?b.openCursor(y,v):b.openCursor(y),S=w.index("_doc_id_rev"),k=[],q=0;g.oncomplete=u,E.onsuccess=a}function i(e,n){return 0===e.limit?n(null,{total_rows:t._meta.docCount,offset:e.skip,rows:[]}):void o(e,n)}i(e,r)}function dt(e){return new qr(function(t){var n=Le([""]);e.objectStore(qo).put(n,"key"),e.onabort=function(e){e.preventDefault(),e.stopPropagation(),t(!1)},e.oncomplete=function(){var e=navigator.userAgent.match(/Chrome\/(\d+)/),n=navigator.userAgent.match(/Edge\//);t(n||!e||parseInt(e[1],10)>=43)}})["catch"](function(){return!1})}function ht(e,t){var n=this;xo.queue.push({action:function(t){pt(n,e,t)},callback:t}),Ye(n.constructor)}function pt(e,t,r){function o(e){var t=e.createObjectStore(go,{keyPath:"id"});e.createObjectStore(bo,{autoIncrement:!0}).createIndex("_doc_id_rev","_doc_id_rev",{unique:!0}),e.createObjectStore(wo,{keyPath:"digest"}),e.createObjectStore(So,{keyPath:"id",autoIncrement:!1}),e.createObjectStore(qo),t.createIndex("deletedOrLocal","deletedOrLocal",{unique:!1}),e.createObjectStore(ko,{keyPath:"_id"});var n=e.createObjectStore(Eo,{autoIncrement:!0});n.createIndex("seq","seq"),n.createIndex("digestSeq","digestSeq",{unique:!0})}function i(e,t){var n=e.objectStore(go);n.createIndex("deletedOrLocal","deletedOrLocal",{unique:!1}),n.openCursor().onsuccess=function(e){var r=e.target.result;if(r){var o=r.value,i=oe(o);o.deletedOrLocal=i?"1":"0",n.put(o),r["continue"]()}else t()}}function a(e){e.createObjectStore(ko,{keyPath:"_id"}).createIndex("_doc_id_rev","_doc_id_rev",{unique:!0})}function s(e,t){var n=e.objectStore(ko),r=e.objectStore(go),o=e.objectStore(bo),i=r.openCursor();i.onsuccess=function(e){var i=e.target.result;if(i){var a=i.value,s=a.id,u=ie(s),c=U(a);if(u){var f=s+"::"+c,l=s+"::",d=s+"::~",h=o.index("_doc_id_rev"),p=IDBKeyRange.bound(l,d,!1,!1),v=h.openCursor(p);v.onsuccess=function(e){if(v=e.target.result){var t=v.value;t._doc_id_rev===f&&n.put(t),o["delete"](v.primaryKey),v["continue"]()}else r["delete"](i.primaryKey),i["continue"]()}}else i["continue"]()}else t&&t()}}function u(e){var t=e.createObjectStore(Eo,{autoIncrement:!0});t.createIndex("seq","seq"),t.createIndex("digestSeq","digestSeq",{unique:!0})}function f(e,t){var n=e.objectStore(bo),r=e.objectStore(wo),o=e.objectStore(Eo),i=r.count();i.onsuccess=function(e){var r=e.target.result;return r?void(n.openCursor().onsuccess=function(e){var n=e.target.result;if(!n)return t();for(var r=n.value,i=n.primaryKey,a=Object.keys(r._attachments||{}),s={},u=0;u<a.length;u++){var c=r._attachments[a[u]];s[c.digest]=!0}var f=Object.keys(s);for(u=0;u<f.length;u++){var l=f[u];o.put({seq:i,digestSeq:l+"::"+i})}n["continue"]()}):t()}}function d(e){function t(e){return e.data?tt(e):(e.deleted="1"===e.deletedOrLocal,e)}var n=e.objectStore(bo),r=e.objectStore(go),o=r.openCursor();o.onsuccess=function(e){function o(){var e=s.id+"::",t=s.id+"::￿",r=n.index("_doc_id_rev").openCursor(IDBKeyRange.bound(e,t)),o=0;r.onsuccess=function(e){var t=e.target.result;if(!t)return s.seq=o,i();var n=t.primaryKey;n>o&&(o=n),t["continue"]()}}function i(){var e=et(s,s.winningRev,s.deleted),t=r.put(e);t.onsuccess=function(){a["continue"]()}}var a=e.target.result;if(a){var s=t(a.value);return s.winningRev=s.winningRev||U(s),s.seq?i():void o()}}}var h=t.name,p=null;e._meta=null,e.type=function(){return"idb"},e._id=l(function(t){t(null,e._meta.instanceId)}),e._bulkDocs=function(n,r,o){ut(t,n,r,e,p,To,o)},e._get=function(e,t,n){function r(){n(a,{doc:o,metadata:i,ctx:s})}var o,i,a,s=t.ctx;if(!s){var u=st(p,[go,bo,wo],"readonly");if(u.error)return n(u.error);s=u.txn}s.objectStore(go).get(e).onsuccess=function(e){if(i=tt(e.target.result),!i)return a=x(Ir,"missing"),r();if(oe(i)&&!t.rev)return a=x(Ir,"deleted"),r();var n=s.objectStore(bo),u=t.rev||i.winningRev,c=i.id+"::"+u;n.index("_doc_id_rev").get(c).onsuccess=function(e){return o=e.target.result,o&&(o=nt(o)),o?void r():(a=x(Ir,"missing"),r())}}},e._getAttachment=function(e,t,n,r,o){var i;if(r.ctx)i=r.ctx;else{var a=st(p,[go,bo,wo],"readonly");if(a.error)return o(a.error);i=a.txn}var s=n.digest,u=n.content_type;i.objectStore(wo).get(s).onsuccess=function(e){var t=e.target.result.body;rt(t,u,r.binary,function(e){o(null,e)})}},e._info=function(t){if(null===p||!Ao.has(h)){var n=new Error("db isn't open");return n.id="idbNull",t(n)}var r,o,i=st(p,[bo],"readonly");if(i.error)return t(i.error);var a=i.txn,s=a.objectStore(bo).openCursor(null,"prev");s.onsuccess=function(t){var n=t.target.result;r=n?n.key:0,o=e._meta.docCount},a.oncomplete=function(){t(null,{doc_count:o,update_seq:r,idb_attachment_format:e._meta.blobSupport?"binary":"base64"})}},e._allDocs=function(t,n){lt(t,e,p,n)},e._changes=function(t){function n(e){function n(){return c.seq!==a?e["continue"]():(u=a,c.winningRev===i._rev?o(i):void r())}function r(){var e=i._id+"::"+c.winningRev,t=_.get(e);t.onsuccess=function(e){o(nt(e.target.result))}}function o(n){var r=t.processChange(n,c,t);r.seq=c.seq;var o=b(r);return"object"==typeof o?t.complete(o):(o&&(g++,l&&m.push(r),t.attachments&&t.include_docs?ot(n,t,d,function(){it([r],t.binary).then(function(){t.onChange(r)})}):t.onChange(r)),void(g!==f&&e["continue"]()))}var i=nt(e.value),a=e.key;if(s&&!s.has(i._id))return e["continue"]();var c;return(c=w.get(i._id))?n():void(y.get(i._id).onsuccess=function(e){c=tt(e.target.result),w.set(i._id,c),n()})}function r(e){var t=e.target.result;t&&n(t)}function o(){var e=[go,bo];t.attachments&&e.push(wo);var n=st(p,e,"readonly");if(n.error)return t.complete(n.error);d=n.txn,d.onabort=Ze(t.complete),d.oncomplete=i,v=d.objectStore(bo),y=d.objectStore(go),_=v.index("_doc_id_rev");var o;o=t.descending?v.openCursor(null,"prev"):v.openCursor(IDBKeyRange.lowerBound(t.since,!0)),o.onsuccess=r}function i(){function e(){t.complete(null,{results:m,last_seq:u})}!t.continuous&&t.attachments?it(m).then(e):e()}if(t=c(t),t.continuous){var a=h+":"+F();return To.addListener(h,a,e,t),To.notify(h),{cancel:function(){To.removeListener(h,a)}}}var s=t.doc_ids&&new mr.Set(t.doc_ids);t.since=t.since||0;var u=t.since,f="limit"in t?t.limit:-1;0===f&&(f=1);var l;l="return_docs"in t?t.return_docs:"returnDocs"in t?t.returnDocs:!0;var d,v,y,_,m=[],g=0,b=O(t),w=new mr.Map;o()},e._close=function(e){return null===p?e(x(Mr)):(p.close(),Ao["delete"](h),p=null,void e())},e._getRevisionTree=function(e,t){var n=st(p,[go],"readonly");if(n.error)return t(n.error);var r=n.txn,o=r.objectStore(go).get(e);o.onsuccess=function(e){var n=tt(e.target.result);n?t(null,n.rev_tree):t(x(Ir))}},e._doCompaction=function(e,t,n){var r=[go,bo,wo,Eo],o=st(p,r,"readwrite");if(o.error)return n(o.error);var i=o.txn,a=i.objectStore(go);a.get(e).onsuccess=function(n){var r=tt(n.target.result);P(r.rev_tree,function(e,n,r,o,i){var a=n+"-"+r;-1!==t.indexOf(a)&&(i.status="missing")}),at(t,e,i);var o=r.winningRev,a=r.deleted;i.objectStore(go).put(et(r,o,a))},i.onabort=Ze(n),i.oncomplete=function(){n()}},e._getLocal=function(e,t){var n=st(p,[ko],"readonly");if(n.error)return t(n.error);var r=n.txn,o=r.objectStore(ko).get(e);o.onerror=Ze(t),o.onsuccess=function(e){var n=e.target.result;n?(delete n._doc_id_rev,t(null,n)):t(x(Ir))}},e._putLocal=function(e,t,n){"function"==typeof t&&(n=t,t={}),delete e._revisions;var r=e._rev,o=e._id;r?e._rev="0-"+(parseInt(r.split("-")[1],10)+1):e._rev="0-1";var i,a=t.ctx;if(!a){var s=st(p,[ko],"readwrite");if(s.error)return n(s.error);a=s.txn,a.onerror=Ze(n),a.oncomplete=function(){i&&n(null,i)}}var u,c=a.objectStore(ko);r?(u=c.get(o),u.onsuccess=function(o){var a=o.target.result;if(a&&a._rev===r){var s=c.put(e);s.onsuccess=function(){i={ok:!0,id:e._id,rev:e._rev},t.ctx&&n(null,i)}}else n(x(Dr))}):(u=c.add(e),u.onerror=function(e){n(x(Dr)),e.preventDefault(),e.stopPropagation()},u.onsuccess=function(){i={ok:!0,id:e._id,rev:e._rev},t.ctx&&n(null,i)})},e._removeLocal=function(e,t,n){"function"==typeof t&&(n=t,t={});var r=t.ctx;if(!r){var o=st(p,[ko],"readwrite");if(o.error)return n(o.error);r=o.txn,r.oncomplete=function(){i&&n(null,i)}}var i,a=e._id,s=r.objectStore(ko),u=s.get(a);u.onerror=Ze(n),u.onsuccess=function(r){var o=r.target.result;o&&o._rev===e._rev?(s["delete"](a),i={ok:!0,id:a,rev:"0-0"},t.ctx&&n(null,i)):n(x(Ir))}},e._destroy=function(e,t){To.removeAllListeners(h);var n=Oo.get(h);n&&n.result&&(n.result.close(),Ao["delete"](h));var r=indexedDB.deleteDatabase(h);r.onsuccess=function(){Oo["delete"](h),m()&&h in localStorage&&delete localStorage[h],t(null,{ok:!0})},r.onerror=Ze(t)};var v=Ao.get(h);if(v)return p=v.idb,e._meta=v.global,void n.nextTick(function(){r(null,e)});var y;y=t.storage?vt(h,t.storage):indexedDB.open(h,mo),Oo.set(h,y),y.onupgradeneeded=function(e){function t(){var e=c[l-1];l++,e&&e(r,t)}var n=e.target.result;if(e.oldVersion<1)return o(n);var r=e.currentTarget.transaction;e.oldVersion<3&&a(n),e.oldVersion<4&&u(n);var c=[i,s,f,d],l=e.oldVersion;t()},y.onsuccess=function(t){p=t.target.result,p.onversionchange=function(){p.close(),Ao["delete"](h)},p.onabort=function(e){w("error","Database has a global failure",e.target.error),p.close(),Ao["delete"](h)};var n=p.transaction([So,qo,go],"readwrite"),o=n.objectStore(So).get(So),i=null,a=null,s=null;o.onsuccess=function(t){var o=function(){null!==i&&null!==a&&null!==s&&(e._meta={name:h,instanceId:s,blobSupport:i,docCount:a},Ao.set(h,{idb:p,global:e._meta}),r(null,e))},u=t.target.result||{id:So};h+"_id"in u?(s=u[h+"_id"],o()):(s=F(),u[h+"_id"]=s,n.objectStore(So).put(u).onsuccess=function(){o()}),fo||(fo=dt(n)),fo.then(function(e){i=e,o()});var c=n.objectStore(go).index("deletedOrLocal");c.count(IDBKeyRange.only("0")).onsuccess=function(e){a=e.target.result,o()}}},y.onerror=function(){var e="Failed to open indexedDB, are you in private browsing mode?";w("error",e),r(x(Xr,e))}}function vt(e,t){try{return indexedDB.open(e,{version:mo,storage:t})}catch(n){return indexedDB.open(e,mo)}}function yt(e){e.adapter("idb",ht,!0)}function _t(e){return decodeURIComponent(escape(e))}function mt(e){return 65>e?e-48:e-55}function gt(e,t,n){for(var r="";n>t;)r+=String.fromCharCode(mt(e.charCodeAt(t++))<<4|mt(e.charCodeAt(t++)));return r}function bt(e,t,n){for(var r="";n>t;)r+=String.fromCharCode(mt(e.charCodeAt(t+2))<<12|mt(e.charCodeAt(t+3))<<8|mt(e.charCodeAt(t))<<4|mt(e.charCodeAt(t+1))),t+=4;return r}function wt(e,t){return"UTF-8"===t?_t(gt(e,0,e.length)):bt(e,0,e.length)}function Et(e){return"'"+e+"'"}function St(e){return e.replace(/\u0002/g,"").replace(/\u0001/g,"").replace(/\u0000/g,"")}function kt(e){return e.replace(/\u0001\u0001/g,"\x00").replace(/\u0001\u0002/g,"").replace(/\u0002\u0002/g,"")}function qt(e){return delete e._id,delete e._rev,JSON.stringify(e)}function xt(e,t,n){return e=JSON.parse(e),e._id=t,e._rev=n,e}function At(e){for(var t="(";e--;)t+="?",e&&(t+=",");return t+")"}function Tt(e,t,n,r,o){return"SELECT "+e+" FROM "+("string"==typeof t?t:t.join(" JOIN "))+(n?" ON "+n:"")+(r?" WHERE "+("string"==typeof r?r:r.join(" AND ")):"")+(o?" ORDER BY "+o:"")}function Ot(e,t,n){function r(){++i===e.length&&o()}function o(){if(a.length){var e="SELECT DISTINCT digest AS digest FROM "+No+" WHERE seq IN "+At(a.length);n.executeSql(e,a,function(e,t){for(var n=[],r=0;r<t.rows.length;r++)n.push(t.rows.item(r).digest);if(n.length){var o="DELETE FROM "+No+" WHERE seq IN ("+a.map(function(){return"?"}).join(",")+")";e.executeSql(o,a,function(e){var t="SELECT digest FROM "+No+" WHERE digest IN ("+n.map(function(){return"?"}).join(",")+")";e.executeSql(t,n,function(e,t){for(var r=new mr.Set,o=0;o<t.rows.length;o++)r.add(t.rows.item(o).digest);n.forEach(function(t){r.has(t)||(e.executeSql("DELETE FROM "+No+" WHERE digest=?",[t]),e.executeSql("DELETE FROM "+Io+" WHERE digest=?",[t]))})})})}})}}if(e.length){var i=0,a=[];e.forEach(function(e){var o="SELECT seq FROM "+Lo+" WHERE doc_id=? AND rev=?";n.executeSql(o,[t,e],function(e,t){if(!t.rows.length)return r();var n=t.rows.item(0).seq;a.push(n),e.executeSql("DELETE FROM "+Lo+" WHERE seq=?",[n],r)})})}}function jt(e){return function(t){w("error","WebSQL threw an error",t);var n=t&&t.constructor.toString().match(/function ([^\(]+)/),r=n&&n[1]||t.type,o=t.target||t.message;e(x(Gr,o,r))}}function Ct(e){if("size"in e)return 1e6*e.size;var t="undefined"!=typeof navigator&&/Android/.test(navigator.userAgent);return t?5e6:1}function Lt(e,t,n,r,o,i,a){function s(){return g?a(g):(i.notify(r._name),r._docCount=-1,void a(null,b))}function u(e,t){var n="SELECT count(*) as cnt FROM "+Io+" WHERE digest=?";m.executeSql(n,[e],function(n,r){if(0===r.rows.item(0).cnt){var o=x(Zr,"unknown stub attachment with digest "+e);t(o)}else t()})}function c(e){function t(){++o===n.length&&e(r)}var n=[];if(y.forEach(function(e){e.data&&e.data._attachments&&Object.keys(e.data._attachments).forEach(function(t){var r=e.data._attachments[t];r.stub&&n.push(r.digest)})}),!n.length)return e();var r,o=0;n.forEach(function(e){u(e,function(e){e&&!r&&(r=e),t()})})}function f(e,t,n,o,i,a,s,u){function c(){function t(e,t){function r(){return++i===a.length&&t(),!1}function o(t){var o="INSERT INTO "+No+" (digest, seq) VALUES (?,?)",i=[n._attachments[t].digest,e];m.executeSql(o,i,r,r)}var i=0,a=Object.keys(n._attachments||{});if(!a.length)return t();for(var s=0;s<a.length;s++)o(a[s])}var n=e.data,r=o?1:0,i=n._id,a=n._rev,s=qt(n),u="INSERT INTO "+Lo+" (doc_id, rev, json, deleted) VALUES (?, ?, ?, ?);",c=[i,a,s,r];m.executeSql(u,c,function(e,n){var r=n.insertId;t(r,function(){d(e,r)})},function(){var e=Tt("seq",Lo,null,"doc_id=? AND rev=?");return m.executeSql(e,[i,a],function(e,n){var o=n.rows.item(0).seq,u="UPDATE "+Lo+" SET json=?, deleted=? WHERE doc_id=? AND rev=?;",c=[s,r,i,a];e.executeSql(u,c,function(e){t(o,function(){d(e,o)})})}),!1})}function f(e){p||(e?(p=e,u(p)):v===y.length&&c())}function l(e){v++,f(e)}function d(n,o){var a=e.metadata.id,c=e.stemmedRevs||[];i&&r.auto_compaction&&(c=W(e.metadata).concat(c)),c.length&&Ot(c,a,n),e.metadata.seq=o,delete e.metadata.rev;var f=i?"UPDATE "+Co+" SET json=?, max_seq=?, winningseq=(SELECT seq FROM "+Lo+" WHERE doc_id="+Co+".id AND rev=?) WHERE id=?":"INSERT INTO "+Co+" (id, winningseq, max_seq, json) VALUES (?,?,?,?);",l=Qe(e.metadata),d=i?[l,o,t,a]:[a,o,o,l];n.executeSql(f,d,function(){b[s]={ok:!0,id:e.metadata.id,rev:t},w.set(a,e.metadata),u()})}var p=null,v=0;e.data._id=e.metadata.id,e.data._rev=e.metadata.rev;var y=Object.keys(e.data._attachments||{});o&&(e.data._deleted=!0),y.forEach(function(n){var r=e.data._attachments[n];if(r.stub)v++,f();else{var o=r.data;delete r.data,r.revpos=parseInt(t,10);var i=r.digest;h(i,o,l)}}),y.length||c()}function l(){Xe(e.revs_limit,y,r,w,m,b,f,n)}function d(e){function t(){++n===y.length&&e()}if(!y.length)return e();var n=0;y.forEach(function(e){if(e._id&&ie(e._id))return t();var n=e.metadata.id;m.executeSql("SELECT json FROM "+Co+" WHERE id = ?",[n],function(e,r){if(r.rows.length){var o=Ve(r.rows.item(0).json);w.set(n,o)}t()})})}function h(e,t,n){var r="SELECT digest FROM "+Io+" WHERE digest=?";m.executeSql(r,[e],function(o,i){return i.rows.length?n():(r="INSERT INTO "+Io+" (digest, body, escaped) VALUES (?,?,1)",void o.executeSql(r,[e,St(t)],function(){n()},function(){return n(),!1}))})}var p=n.new_edits,v=t.docs,y=v.map(function(e){if(e._id&&ie(e._id))return e;var t=Oe(e,p);return t}),_=y.filter(function(e){return e.error});if(_.length)return a(_[0]);var m,g,b=new Array(y.length),w=new mr.Map;Je(y,"binary",function(e){return e?a(e):void o.transaction(function(e){m=e,c(function(e){e?g=e:d(l)})},jt(a),s)})}function It(e){return e.websql(e.name,e.version,e.description,e.size)}function Dt(e){try{return{db:It(e)}}catch(t){return{error:t}}}function Rt(e){var t=Bo.get(e.name);return t||(t=Dt(e),Bo.set(e.name,t),t.db&&(t.db._sqlitePlugin="undefined"!=typeof sqlitePlugin)),t}function Nt(e,t,n,r,o){function i(){++u===s.length&&o&&o()}function a(e,o){var a=e._attachments[o],s={binary:t.binary,ctx:r};n._getAttachment(e._id,o,a,s,function(t,n){e._attachments[o]=pr.extend(h(a,["digest","content_type"]),{data:n}),i()})}var s=Object.keys(e._attachments||{});if(!s.length)return o&&o();var u=0;s.forEach(function(n){t.attachments&&t.include_docs?a(e,n):(e._attachments[n].stub=!0,i())})}function Bt(e,t){function n(){m()&&(window.localStorage["_pouch__websqldb_"+g._name]=!0),t(null,g)}function r(e,t){e.executeSql(Ho),e.executeSql("ALTER TABLE "+Lo+" ADD COLUMN deleted TINYINT(1) DEFAULT 0",[],function(){e.executeSql(Uo),e.executeSql("ALTER TABLE "+Co+" ADD COLUMN local TINYINT(1) DEFAULT 0",[],function(){e.executeSql("CREATE INDEX IF NOT EXISTS 'doc-store-local-idx' ON "+Co+" (local, id)");var n="SELECT "+Co+".winningseq AS seq, "+Co+".json AS metadata FROM "+Lo+" JOIN "+Co+" ON "+Lo+".seq = "+Co+".winningseq";e.executeSql(n,[],function(e,n){for(var r=[],o=[],i=0;i<n.rows.length;i++){var a=n.rows.item(i),s=a.seq,u=JSON.parse(a.metadata);oe(u)&&r.push(s),ie(u.id)&&o.push(u.id)}e.executeSql("UPDATE "+Co+"SET local = 1 WHERE id IN "+At(o.length),o,function(){e.executeSql("UPDATE "+Lo+" SET deleted = 1 WHERE seq IN "+At(r.length),r,t)})})})})}function o(e,t){var n="CREATE TABLE IF NOT EXISTS "+Do+" (id UNIQUE, rev, json)";e.executeSql(n,[],function(){var n="SELECT "+Co+".id AS id, "+Lo+".json AS data FROM "+Lo+" JOIN "+Co+" ON "+Lo+".seq = "+Co+".winningseq WHERE local = 1";e.executeSql(n,[],function(e,n){function r(){if(!o.length)return t(e);var n=o.shift(),i=JSON.parse(n.data)._rev;e.executeSql("INSERT INTO "+Do+" (id, rev, json) VALUES (?,?,?)",[n.id,i,n.data],function(e){e.executeSql("DELETE FROM "+Co+" WHERE id=?",[n.id],function(e){e.executeSql("DELETE FROM "+Lo+" WHERE seq=?",[n.seq],function(){r()})})})}for(var o=[],i=0;i<n.rows.length;i++)o.push(n.rows.item(i));r()})})}function i(e,t){function n(n){function r(){if(!n.length)return t(e);var o=n.shift(),i=wt(o.hex,_),a=i.lastIndexOf("::"),s=i.substring(0,a),u=i.substring(a+2),c="UPDATE "+Lo+" SET doc_id=?, rev=? WHERE doc_id_rev=?";e.executeSql(c,[s,u,i],function(){r()})}r()}var r="ALTER TABLE "+Lo+" ADD COLUMN doc_id";e.executeSql(r,[],function(e){var t="ALTER TABLE "+Lo+" ADD COLUMN rev";e.executeSql(t,[],function(e){e.executeSql(Po,[],function(e){var t="SELECT hex(doc_id_rev) as hex FROM "+Lo;e.executeSql(t,[],function(e,t){for(var r=[],o=0;o<t.rows.length;o++)r.push(t.rows.item(o));n(r)})})})})}function a(e,t){function n(e){var n="SELECT COUNT(*) AS cnt FROM "+Io;e.executeSql(n,[],function(e,n){function r(){var n=Tt(zo+", "+Co+".id AS id",[Co,Lo],Wo,null,Co+".id ");n+=" LIMIT "+a+" OFFSET "+i,i+=a,e.executeSql(n,[],function(e,n){function o(e,t){var n=i[e]=i[e]||[];-1===n.indexOf(t)&&n.push(t)}if(!n.rows.length)return t(e);for(var i={},a=0;a<n.rows.length;a++)for(var s=n.rows.item(a),u=xt(s.data,s.id,s.rev),c=Object.keys(u._attachments||{}),f=0;f<c.length;f++){var l=u._attachments[c[f]];o(l.digest,s.seq)}var d=[];if(Object.keys(i).forEach(function(e){var t=i[e];t.forEach(function(t){d.push([e,t])})}),!d.length)return r();var h=0;d.forEach(function(t){var n="INSERT INTO "+No+" (digest, seq) VALUES (?,?)";e.executeSql(n,t,function(){++h===d.length&&r()})})})}var o=n.rows.item(0).cnt;if(!o)return t(e);var i=0,a=10;r()})}var r="CREATE TABLE IF NOT EXISTS "+No+" (digest, seq INTEGER)";e.executeSql(r,[],function(e){e.executeSql(Jo,[],function(e){e.executeSql(Ko,[],n)})})}function s(e,t){var n="ALTER TABLE "+Io+" ADD COLUMN escaped TINYINT(1) DEFAULT 0";e.executeSql(n,[],t)}function u(e,t){var n="ALTER TABLE "+Co+" ADD COLUMN max_seq INTEGER";e.executeSql(n,[],function(e){var n="UPDATE "+Co+" SET max_seq=(SELECT MAX(seq) FROM "+Lo+" WHERE doc_id=id)";e.executeSql(n,[],function(e){var n="CREATE UNIQUE INDEX IF NOT EXISTS 'doc-max-seq-idx' ON "+Co+" (max_seq)";e.executeSql(n,[],t)})})}function f(e,t){e.executeSql('SELECT HEX("a") AS hex',[],function(e,n){var r=n.rows.item(0).hex;_=2===r.length?"UTF-8":"UTF-16",t()})}function d(){for(;E.length>0;){var e=E.pop();e(null,b)}}function h(e,t){if(0===t){var n="CREATE TABLE IF NOT EXISTS "+Ro+" (dbid, db_version INTEGER)",c="CREATE TABLE IF NOT EXISTS "+Io+" (digest UNIQUE, escaped TINYINT(1), body BLOB)",f="CREATE TABLE IF NOT EXISTS "+No+" (digest, seq INTEGER)",l="CREATE TABLE IF NOT EXISTS "+Co+" (id unique, json, winningseq, max_seq INTEGER UNIQUE)",h="CREATE TABLE IF NOT EXISTS "+Lo+" (seq INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT, json, deleted TINYINT(1), doc_id, rev)",p="CREATE TABLE IF NOT EXISTS "+Do+" (id UNIQUE, rev, json)";e.executeSql(c),e.executeSql(p),e.executeSql(f,[],function(){e.executeSql(Ko),e.executeSql(Jo)}),e.executeSql(l,[],function(){e.executeSql(Ho),e.executeSql(h,[],function(){e.executeSql(Uo),e.executeSql(Po),e.executeSql(n,[],function(){var t="INSERT INTO "+Ro+" (db_version, dbid) VALUES (?,?)";b=F();var n=[jo,b];e.executeSql(t,n,function(){d()})})})})}else{var v=function(){var n=jo>t;n&&e.executeSql("UPDATE "+Ro+" SET db_version = "+jo);var r="SELECT dbid FROM "+Ro;e.executeSql(r,[],function(e,t){b=t.rows.item(0).dbid,d()})},y=[r,o,i,a,s,u,v],_=t,m=function(e){y[_-1](e,m),_++};m(e)}}function p(){q.transaction(function(e){f(e,function(){v(e)})},jt(t),n)}function v(e){var t="SELECT sql FROM sqlite_master WHERE tbl_name = "+Ro;e.executeSql(t,[],function(e,t){t.rows.length?/db_version/.test(t.rows.item(0).sql)?e.executeSql("SELECT db_version FROM "+Ro,[],function(e,t){var n=t.rows.item(0).db_version;h(e,n)}):e.executeSql("ALTER TABLE "+Ro+" ADD COLUMN db_version INTEGER",[],function(){h(e,1)}):h(e,0)})}function y(e,t){if(-1!==g._docCount)return t(g._docCount);var n=Tt("COUNT("+Co+".id) AS 'num'",[Co,Lo],Wo,Lo+".deleted=0");e.executeSql(n,[],function(e,n){g._docCount=n.rows.item(0).num,t(g._docCount)})}var _,g=this,b=null,w=Ct(e),E=[];g._docCount=-1,g._name=e.name;var S=pr.extend({},e,{version:Fo,description:e.name,size:w}),k=Rt(S);if(k.error)return jt(t)(k.error);var q=k.db;"function"!=typeof q.readTransaction&&(q.readTransaction=q.transaction),p(),g.type=function(){return"websql"},g._id=l(function(e){e(null,b)}),g._info=function(e){q.readTransaction(function(t){y(t,function(n){var r="SELECT MAX(seq) AS seq FROM "+Lo;t.executeSql(r,[],function(t,r){var o=r.rows.item(0).seq||0;e(null,{doc_count:n,update_seq:o,sqlite_plugin:q._sqlitePlugin,websql_encoding:_})})})},jt(e))},g._bulkDocs=function(t,n,r){Lt(e,t,n,g,q,Mo,r)},g._get=function(e,t,n){function r(){n(a,{doc:o,metadata:i,ctx:s})}var o,i,a,s=t.ctx;if(!s)return q.readTransaction(function(r){g._get(e,pr.extend({ctx:r},t),n)});var u,c;t.rev?(u=Tt(zo,[Co,Lo],Co+".id="+Lo+".doc_id",[Lo+".doc_id=?",Lo+".rev=?"]),c=[e,t.rev]):(u=Tt(zo,[Co,Lo],Wo,Co+".id=?"),c=[e]),s.executeSql(u,c,function(e,n){if(!n.rows.length)return a=x(Ir,"missing"),r();var s=n.rows.item(0);return i=Ve(s.metadata),s.deleted&&!t.rev?(a=x(Ir,"deleted"),r()):(o=xt(s.data,i.id,s.rev),void r())})},g._allDocs=function(e,t){var n,r=[],o="startkey"in e?e.startkey:!1,i="endkey"in e?e.endkey:!1,a="key"in e?e.key:!1,s="descending"in e?e.descending:!1,u="limit"in e?e.limit:-1,c="skip"in e?e.skip:0,f=e.inclusive_end!==!1,l=[],d=[];if(a!==!1)d.push(Co+".id = ?"),l.push(a);else if(o!==!1||i!==!1){if(o!==!1&&(d.push(Co+".id "+(s?"<=":">=")+" ?"),l.push(o)),i!==!1){var h=s?">":"<";f&&(h+="="),d.push(Co+".id "+h+" ?"),l.push(i)}a!==!1&&(d.push(Co+".id = ?"),l.push(a))}"ok"!==e.deleted&&d.push(Lo+".deleted = 0"),q.readTransaction(function(t){y(t,function(o){if(n=o,0!==u){var i=Tt(zo,[Co,Lo],Wo,d,Co+".id "+(s?"DESC":"ASC"));i+=" LIMIT "+u+" OFFSET "+c,t.executeSql(i,l,function(t,n){for(var o=0,i=n.rows.length;i>o;o++){var a=n.rows.item(o),s=Ve(a.metadata),u=s.id,c=xt(a.data,u,a.rev),f=c._rev,l={id:u,key:u,value:{rev:f}};if(e.include_docs&&(l.doc=c,l.doc._rev=f,e.conflicts&&(l.doc._conflicts=J(s)),Nt(l.doc,e,g,t)),a.deleted){if("ok"!==e.deleted)continue;l.value.deleted=!0,l.doc=null}r.push(l)}})}})},jt(t),function(){t(null,{total_rows:n,offset:e.skip,rows:r})})},g._changes=function(e){function t(){var t=Co+".json AS metadata, "+Co+".max_seq AS maxSeq, "+Lo+".json AS winningDoc, "+Lo+".rev AS winningRev ",n=Co+" JOIN "+Lo,u=Co+".id="+Lo+".doc_id AND "+Co+".winningseq="+Lo+".seq",c=["maxSeq > ?"],f=[e.since];e.doc_ids&&(c.push(Co+".id IN "+At(e.doc_ids.length)),f=f.concat(e.doc_ids));var l="maxSeq "+(r?"DESC":"ASC"),d=Tt(t,n,u,c,l),h=O(e);e.view||e.filter||(d+=" LIMIT "+o);var p=e.since||0;q.readTransaction(function(t){t.executeSql(d,f,function(t,n){function r(t){return function(){e.onChange(t)}}for(var u=0,c=n.rows.length;c>u;u++){var f=n.rows.item(u),l=Ve(f.metadata);p=f.maxSeq;var d=xt(f.winningDoc,l.id,f.winningRev),v=e.processChange(d,l,e);v.seq=f.maxSeq;var y=h(v);if("object"==typeof y)return e.complete(y);if(y&&(s++,i&&a.push(v),e.attachments&&e.include_docs?Nt(d,e,g,t,r(v)):r(v)()),s===o)break}})},jt(e.complete),function(){e.continuous||e.complete(null,{results:a,last_seq:p})})}if(e=c(e),e.continuous){var n=g._name+":"+F();return Mo.addListener(g._name,n,g,e),Mo.notify(g._name),{cancel:function(){Mo.removeListener(g._name,n)}}}var r=e.descending;e.since=e.since&&!r?e.since:0;var o="limit"in e?e.limit:-1;0===o&&(o=1);var i;i="return_docs"in e?e.return_docs:"returnDocs"in e?e.returnDocs:!0;var a=[],s=0;t()},g._close=function(e){e()},g._getAttachment=function(e,t,n,r,o){var i,a=r.ctx,s=n.digest,u=n.content_type,c="SELECT escaped, CASE WHEN escaped = 1 THEN body ELSE HEX(body) END AS body FROM "+Io+" WHERE digest=?";a.executeSql(c,[s],function(e,t){var n=t.rows.item(0),a=n.escaped?kt(n.body):wt(n.body,_);i=r.binary?De(a,u):vo(a),o(null,i)})},g._getRevisionTree=function(e,t){q.readTransaction(function(n){var r="SELECT json AS metadata FROM "+Co+" WHERE id = ?";n.executeSql(r,[e],function(e,n){if(n.rows.length){var r=Ve(n.rows.item(0).metadata);t(null,r.rev_tree)}else t(x(Ir))})})},g._doCompaction=function(e,t,n){return t.length?void q.transaction(function(n){var r="SELECT json AS metadata FROM "+Co+" WHERE id = ?";n.executeSql(r,[e],function(n,r){var o=Ve(r.rows.item(0).metadata);P(o.rev_tree,function(e,n,r,o,i){var a=n+"-"+r;-1!==t.indexOf(a)&&(i.status="missing")});var i="UPDATE "+Co+" SET json = ? WHERE id = ?";n.executeSql(i,[Qe(o),e])}),Ot(t,e,n)},jt(n),function(){n()}):n()},g._getLocal=function(e,t){q.readTransaction(function(n){var r="SELECT json, rev FROM "+Do+" WHERE id=?";n.executeSql(r,[e],function(n,r){if(r.rows.length){var o=r.rows.item(0),i=xt(o.json,e,o.rev);t(null,i)}else t(x(Ir))})})},g._putLocal=function(e,t,n){function r(e){var r,c;i?(r="UPDATE "+Do+" SET rev=?, json=? WHERE id=? AND rev=?",c=[o,u,a,i]):(r="INSERT INTO "+Do+" (id, rev, json) VALUES (?,?,?)",c=[a,o,u]),e.executeSql(r,c,function(e,r){r.rowsAffected?(s={ok:!0,id:a,rev:o},t.ctx&&n(null,s)):n(x(Dr))},function(){return n(x(Dr)),!1})}"function"==typeof t&&(n=t,t={}),delete e._revisions;var o,i=e._rev,a=e._id;o=i?e._rev="0-"+(parseInt(i.split("-")[1],10)+1):e._rev="0-1";var s,u=qt(e);t.ctx?r(t.ctx):q.transaction(r,jt(n),function(){s&&n(null,s)})},g._removeLocal=function(e,t,n){function r(r){var i="DELETE FROM "+Do+" WHERE id=? AND rev=?",a=[e._id,e._rev];r.executeSql(i,a,function(r,i){return i.rowsAffected?(o={ok:!0,id:e._id,rev:"0-0"},void(t.ctx&&n(null,o))):n(x(Ir))})}"function"==typeof t&&(n=t,t={});var o;t.ctx?r(t.ctx):q.transaction(r,jt(n),function(){o&&n(null,o)})},g._destroy=function(e,t){Mo.removeAllListeners(g._name),q.transaction(function(e){var t=[Co,Lo,Io,Ro,Do,No];t.forEach(function(t){e.executeSql("DROP TABLE IF EXISTS "+t,[])})},jt(t),function(){m()&&(delete window.localStorage["_pouch__websqldb_"+g._name],delete window.localStorage[g._name]),t(null,{ok:!0})})}}function Mt(){try{return openDatabase("_pouch_validate_websql",1,"",1),!0}catch(e){return!1}}function Ft(){if("undefined"==typeof indexedDB||null===indexedDB||!/iP(hone|od|ad)/.test(navigator.userAgent))return!0;var e=m(),t="_pouch__websqldb_valid_"+navigator.userAgent;if(e&&localStorage[t])return"1"===localStorage[t];var n=Mt();return e&&(localStorage[t]=n?"1":"0"),n}function Ut(){return"undefined"!=typeof SQLitePlugin?!0:"undefined"==typeof openDatabase?!1:Ft()}function Pt(e){return function(t,n,r,o){if("undefined"!=typeof sqlitePlugin){var i=pr.extend({},e,{name:t,version:n,description:r,size:o});return sqlitePlugin.openDatabase(i)}return openDatabase(t,n,r,o)}}function Ht(e,t){var n=Pt(e),r=pr.extend({websql:n},e);Bt.call(this,r,t)}function Kt(e){e.adapter("websql",Ht,!0)}function Jt(){for(var e={},t=new qr(function(t,n){e.resolve=t,e.reject=n}),n=new Array(arguments.length),r=0;r<n.length;r++)n[r]=arguments[r];return e.promise=t,qr.resolve().then(function(){return fetch.apply(null,n)}).then(function(t){e.resolve(t)})["catch"](function(t){e.reject(t)}),e}function Wt(e,t){var n,r,o,i=new Headers,a={method:e.method,credentials:"include",headers:i};return e.json&&(i.set("Accept","application/json"),i.set("Content-Type",e.headers["Content-Type"]||"application/json")),e.body&&e.body instanceof Blob?Me(e.body,function(e){a.body=e}):e.body&&e.processData&&"string"!=typeof e.body?a.body=JSON.stringify(e.body):"body"in e?a.body=e.body:a.body=null,Object.keys(e.headers).forEach(function(t){e.headers.hasOwnProperty(t)&&i.set(t,e.headers[t])}),n=Jt(e.url,a),e.timeout>0&&(r=setTimeout(function(){n.reject(new Error("Load timeout for resource: "+e.url))},e.timeout)),n.promise.then(function(t){return o={statusCode:t.status},e.timeout>0&&clearTimeout(r),o.statusCode>=200&&o.statusCode<300?e.binary?t.blob():t.text():t.json()}).then(function(e){o.statusCode>=200&&o.statusCode<300?t(null,o,e):t(e,o)})["catch"](function(e){t(e,o)}),{abort:n.reject}}function zt(e,t){var n,r,o=!1,i=function(){n.abort()},a=function(){o=!0,n.abort()};n=e.xhr?new e.xhr:new XMLHttpRequest;try{n.open(e.method,e.url)}catch(s){t(s,{statusCode:413})}n.withCredentials="withCredentials"in e?e.withCredentials:!0,"GET"===e.method?delete e.headers["Content-Type"]:e.json&&(e.headers.Accept="application/json",e.headers["Content-Type"]=e.headers["Content-Type"]||"application/json",e.body&&e.processData&&"string"!=typeof e.body&&(e.body=JSON.stringify(e.body))),e.binary&&(n.responseType="arraybuffer"),"body"in e||(e.body=null);for(var u in e.headers)e.headers.hasOwnProperty(u)&&n.setRequestHeader(u,e.headers[u]);return e.timeout>0&&(r=setTimeout(a,e.timeout),n.onprogress=function(){clearTimeout(r),4!==n.readyState&&(r=setTimeout(a,e.timeout))},"undefined"!=typeof n.upload&&(n.upload.onprogress=n.onprogress)),n.onreadystatechange=function(){if(4===n.readyState){var r={statusCode:n.status};if(n.status>=200&&n.status<300){var i;i=e.binary?Le([n.response||""],{type:n.getResponseHeader("Content-Type")}):n.responseText,t(null,r,i)}else{var a={};if(o)a=new Error("ETIMEDOUT"),r.statusCode=400;else try{a=JSON.parse(n.response)}catch(s){}t(a,r)}}},e.body&&e.body instanceof Blob?Me(e.body,function(e){n.send(e)}):n.send(e.body),{abort:i}}function Xt(){try{return new XMLHttpRequest,!0}catch(e){return!1}}function Gt(e,t){return Xo||e.xhr?zt(e,t):Wt(e,t)}function Vt(){return""}function Qt(e,t){function n(t,n,r){
if(!e.binary&&e.json&&"string"==typeof t)try{t=JSON.parse(t)}catch(o){return r(o)}Array.isArray(t)&&(t=t.map(function(e){return e.error||e.missing?A(e):e})),e.binary&&Go(t,n),r(null,t,n)}function r(e,t){var n,r;if(e.code&&e.status){var o=new Error(e.message||e.code);return o.status=e.status,t(o)}if(e.message&&"ETIMEDOUT"===e.message)return t(e);try{n=JSON.parse(e.responseText),r=A(n)}catch(i){r=A(e)}t(r)}e=c(e);var o={method:"GET",headers:{},json:!0,processData:!0,timeout:1e4,cache:!1};return e=pr.extend(o,e),e.json&&(e.binary||(e.headers.Accept="application/json"),e.headers["Content-Type"]=e.headers["Content-Type"]||"application/json"),e.binary&&(e.encoding=null,e.json=!1),e.processData||(e.json=!1),Gt(e,function(o,i,a){if(o)return o.status=i?i.statusCode:400,r(o,t);var s,u=i.headers&&i.headers["content-type"],c=a||Vt();if(!e.binary&&(e.json||!e.processData)&&"object"!=typeof c&&(/json/.test(u)||/^[\s]*\{/.test(c)&&/\}[\s]*$/.test(c)))try{c=JSON.parse(c.toString())}catch(f){}i.statusCode>=200&&i.statusCode<300?n(c,i,t):(s=A(c),s.status=i.statusCode,t(s))})}function $t(e,t){var n=navigator&&navigator.userAgent?navigator.userAgent.toLowerCase():"",r=-1!==n.indexOf("safari")&&-1===n.indexOf("chrome"),o=-1!==n.indexOf("msie"),i=-1!==n.indexOf("edge"),a=r||(o||i)&&"GET"===e.method,s="cache"in e?e.cache:!0,u=/^blob:/.test(e.url);if(!u&&(a||!s)){var c=-1!==e.url.indexOf("?");e.url+=(c?"&":"?")+"_nonce="+Date.now()}return Qt(e,t)}function Yt(e){var t=e.doc&&e.doc._attachments;t&&Object.keys(t).forEach(function(e){var n=t[e];n.data=Re(n.data,n.content_type)})}function Zt(e){return/^_design/.test(e)?"_design/"+encodeURIComponent(e.slice(8)):/^_local/.test(e)?"_local/"+encodeURIComponent(e.slice(7)):encodeURIComponent(e)}function en(e){return e._attachments&&Object.keys(e._attachments)?qr.all(Object.keys(e._attachments).map(function(t){var n=e._attachments[t];return n.data&&"string"!=typeof n.data?new qr(function(e){Be(n.data,e)}).then(function(e){n.data=e}):void 0})):qr.resolve()}function tn(e){var t=R(e);(t.user||t.password)&&(t.auth={username:t.user,password:t.password});var n=t.path.replace(/(^\/|\/$)/g,"").split("/");return t.db=n.pop(),-1===t.db.indexOf("%")&&(t.db=encodeURIComponent(t.db)),t.path=n.join("/"),t}function nn(e,t){return rn(e,e.db+"/"+t)}function rn(e,t){var n=e.path?"/":"";return e.protocol+"://"+e.host+(e.port?":"+e.port:"")+"/"+e.path+n+t}function on(e){return"?"+Object.keys(e).map(function(t){return t+"="+encodeURIComponent(e[t])}).join("&")}function an(e,t){function n(e,t,n){var r=e.ajax||{},o=pr.extend(c(p),r,t);return Zo(o.method+" "+o.url),s._ajax(o,n)}function r(e,t){return new qr(function(r,o){n(e,t,function(e,t){return e?o(e):void r(t)})})}function o(e,t){return d(e,gr(function(e){i().then(function(){return t.apply(this,e)})["catch"](function(t){var n=e.pop();n(t)})}))}function i(){if(e.skipSetup||e.skip_setup)return qr.resolve();if(g)return g;var t={method:"GET",url:l};return g=r({},t)["catch"](function(e){return e&&e.status&&404===e.status?(k(404,"PouchDB is just detecting if the remote exists."),r({},{method:"PUT",url:l})):qr.reject(e)})["catch"](function(e){return e&&e.status&&412===e.status?!0:qr.reject(e)}),g["catch"](function(){g=null}),g}function a(e){return e.split("/").map(encodeURIComponent).join("/")}var s=this,u=tn;e.getHost&&(u=e.getHost);var f=u(e.name,e),l=nn(f,"");e=c(e);var p=e.ajax||{};if(s.getUrl=function(){return l},s.getHeaders=function(){return p.headers||{}},e.auth||f.auth){var v=e.auth||f.auth,_=v.username+":"+v.password,m=vo(unescape(encodeURIComponent(_)));p.headers=p.headers||{},p.headers.Authorization="Basic "+m}s._ajax=$t;var g;setTimeout(function(){t(null,s)}),s.type=function(){return"http"},s.id=o("id",function(e){n({},{method:"GET",url:rn(f,"")},function(t,n){var r=n&&n.uuid?n.uuid+f.db:nn(f,"");e(null,r)})}),s.request=o("request",function(e,t){e.url=nn(f,e.url),n({},e,t)}),s.compact=o("compact",function(e,t){"function"==typeof e&&(t=e,e={}),e=c(e),n(e,{url:nn(f,"_compact"),method:"POST"},function(){function n(){s.info(function(r,o){o&&!o.compact_running?t(null,{ok:!0}):setTimeout(n,e.interval||200)})}n()})}),s.bulkGet=d("bulkGet",function(e,t){function r(t){var r={};e.revs&&(r.revs=!0),e.attachments&&(r.attachments=!0),n({},{url:nn(f,"_bulk_get"+on(r)),method:"POST",body:{docs:e.docs}},t)}function o(){function n(e){return function(n,r){s[e]=r.results,++a===o&&t(null,{results:j(s)})}}for(var r=Qo,o=Math.ceil(e.docs.length/r),a=0,s=new Array(o),u=0;o>u;u++){var c=h(e,["revs","attachments"]);c.ajax=p,c.docs=e.docs.slice(u*r,Math.min(e.docs.length,(u+1)*r)),y(i,c,n(u))}}var i=this,a=rn(f,""),s=$o[a];"boolean"!=typeof s?r(function(e,n){if(e){var r=Math.floor(e.status/100);4===r||5===r?($o[a]=!1,k(e.status,"PouchDB is just detecting if the remote supports the _bulk_get API."),o()):t(e)}else $o[a]=!0,t(null,n)}):s?r(t):o()}),s._info=function(e){i().then(function(){n({},{method:"GET",url:nn(f,"")},function(t,n){return t?e(t):(n.host=nn(f,""),void e(null,n))})})["catch"](e)},s.get=o("get",function(e,t,n){function o(e){var n=e._attachments,o=n&&Object.keys(n);return n&&o.length?qr.all(o.map(function(o){var i=n[o],s=Zt(e._id)+"/"+a(o)+"?rev="+e._rev;return r(t,{method:"GET",url:nn(f,s),binary:!0}).then(function(e){return t.binary?e:new qr(function(t){Be(e,t)})}).then(function(e){delete i.stub,delete i.length,i.data=e})})):void 0}function i(e){return Array.isArray(e)?qr.all(e.map(function(e){return e.ok?o(e.ok):void 0})):o(e)}"function"==typeof t&&(n=t,t={}),t=c(t);var s={};t.revs&&(s.revs=!0),t.revs_info&&(s.revs_info=!0),t.open_revs&&("all"!==t.open_revs&&(t.open_revs=JSON.stringify(t.open_revs)),s.open_revs=t.open_revs),t.rev&&(s.rev=t.rev),t.conflicts&&(s.conflicts=t.conflicts),e=Zt(e);var u={method:"GET",url:nn(f,e+on(s))};r(t,u).then(function(e){return qr.resolve().then(function(){return t.attachments?i(e):void 0}).then(function(){n(null,e)})})["catch"](n)}),s.remove=o("remove",function(e,t,r,o){var i;"string"==typeof t?(i={_id:e,_rev:t},"function"==typeof r&&(o=r,r={})):(i=e,"function"==typeof t?(o=t,r={}):(o=r,r=t));var a=i._rev||r.rev;n(r,{method:"DELETE",url:nn(f,Zt(i._id))+"?rev="+a},o)}),s.getAttachment=o("getAttachment",function(e,t,r,o){"function"==typeof r&&(o=r,r={});var i=r.rev?"?rev="+r.rev:"",s=nn(f,Zt(e))+"/"+a(t)+i;n(r,{method:"GET",url:s,binary:!0},o)}),s.removeAttachment=o("removeAttachment",function(e,t,r,o){var i=nn(f,Zt(e)+"/"+a(t))+"?rev="+r;n({},{method:"DELETE",url:i},o)}),s.putAttachment=o("putAttachment",function(e,t,r,o,i,s){"function"==typeof i&&(s=i,i=o,o=r,r=null);var u=Zt(e)+"/"+a(t),c=nn(f,u);if(r&&(c+="?rev="+r),"string"==typeof o){var l;try{l=po(o)}catch(d){return s(x(Ur,"Attachment is not a valid base64 string"))}o=l?De(l,i):""}var h={headers:{"Content-Type":i},method:"PUT",url:c,processData:!1,body:o,timeout:p.timeout||6e4};n({},h,s)}),s._bulkDocs=function(e,t,r){e.new_edits=t.new_edits,i().then(function(){return qr.all(e.docs.map(en))}).then(function(){n(t,{method:"POST",url:nn(f,"_bulk_docs"),body:e},function(e,t){return e?r(e):(t.forEach(function(e){e.ok=!0}),void r(null,t))})})["catch"](r)},s.allDocs=o("allDocs",function(e,t){"function"==typeof e&&(t=e,e={}),e=c(e);var n,o={},i="GET";e.conflicts&&(o.conflicts=!0),e.descending&&(o.descending=!0),e.include_docs&&(o.include_docs=!0),e.attachments&&(o.attachments=!0),e.key&&(o.key=JSON.stringify(e.key)),e.start_key&&(e.startkey=e.start_key),e.startkey&&(o.startkey=JSON.stringify(e.startkey)),e.end_key&&(e.endkey=e.end_key),e.endkey&&(o.endkey=JSON.stringify(e.endkey)),"undefined"!=typeof e.inclusive_end&&(o.inclusive_end=!!e.inclusive_end),"undefined"!=typeof e.limit&&(o.limit=e.limit),"undefined"!=typeof e.skip&&(o.skip=e.skip);var a=on(o);if("undefined"!=typeof e.keys){var s="keys="+encodeURIComponent(JSON.stringify(e.keys));s.length+a.length+1<=Yo?a+="&"+s:(i="POST",n={keys:e.keys})}r(e,{method:i,url:nn(f,"_all_docs"+a),body:n}).then(function(n){e.include_docs&&e.attachments&&e.binary&&n.rows.forEach(Yt),t(null,n)})["catch"](t)}),s._changes=function(e){var t="batch_size"in e?e.batch_size:Vo;e=c(e),e.timeout="timeout"in e?e.timeout:"timeout"in p?p.timeout:3e4;var r,o=e.timeout?{timeout:e.timeout-5e3}:{},a="undefined"!=typeof e.limit?e.limit:!1;r="return_docs"in e?e.return_docs:"returnDocs"in e?e.returnDocs:!0;var s=a;if(e.style&&(o.style=e.style),(e.include_docs||e.filter&&"function"==typeof e.filter)&&(o.include_docs=!0),e.attachments&&(o.attachments=!0),e.continuous&&(o.feed="longpoll"),e.conflicts&&(o.conflicts=!0),e.descending&&(o.descending=!0),"heartbeat"in e?e.heartbeat&&(o.heartbeat=e.heartbeat):o.heartbeat=1e4,e.filter&&"string"==typeof e.filter&&(o.filter=e.filter),e.view&&"string"==typeof e.view&&(o.filter="_view",o.view=e.view),e.query_params&&"object"==typeof e.query_params)for(var u in e.query_params)e.query_params.hasOwnProperty(u)&&(o[u]=e.query_params[u]);var l,d="GET";if(e.doc_ids){o.filter="_doc_ids";var h=JSON.stringify(e.doc_ids);h.length<Yo?o.doc_ids=h:(d="POST",l={doc_ids:e.doc_ids})}var v,y,_=function(r,u){if(!e.aborted){o.since=r,"object"==typeof o.since&&(o.since=JSON.stringify(o.since)),e.descending?a&&(o.limit=s):o.limit=!a||s>t?t:s;var c={method:d,url:nn(f,"_changes"+on(o)),timeout:e.timeout,body:l};y=r,e.aborted||i().then(function(){v=n(e,c,u)})["catch"](u)}},m={results:[]},g=function(n,o){if(!e.aborted){var i=0;if(o&&o.results){i=o.results.length,m.last_seq=o.last_seq;var u={};u.query=e.query_params,o.results=o.results.filter(function(t){s--;var n=O(e)(t);return n&&(e.include_docs&&e.attachments&&e.binary&&Yt(t),r&&m.results.push(t),e.onChange(t)),n})}else if(n)return e.aborted=!0,void e.complete(n);o&&o.last_seq&&(y=o.last_seq);var c=a&&0>=s||o&&t>i||e.descending;(!e.continuous||a&&0>=s)&&c?e.complete(null,m):setTimeout(function(){_(y,g)},0)}};return _(e.since||0,g),{cancel:function(){e.aborted=!0,v&&v.abort()}}},s.revsDiff=o("revsDiff",function(e,t,r){"function"==typeof t&&(r=t,t={}),n(t,{method:"POST",url:nn(f,"_revs_diff"),body:e},r)}),s._close=function(e){e()},s._destroy=function(e,t){n(e,{url:nn(f,""),method:"DELETE"},function(e,n){return e&&e.status&&404!==e.status?t(e):void t(null,n)})}}function sn(e){e.adapter("http",an,!1),e.adapter("https",an,!1)}function un(){this.promise=new qr(function(e){e()})}function cn(e){var t=e.db,n=e.viewName,r=e.map,o=e.reduce,i=e.temporary,a=r.toString()+(o&&o.toString())+"undefined";if(!i&&t._cachedViews){var s=t._cachedViews[a];if(s)return qr.resolve(s)}return t.info().then(function(e){function s(e){e.views=e.views||{};var t=n;-1===t.indexOf("/")&&(t=n+"/"+n);var r=e.views[t]=e.views[t]||{};if(!r[u])return r[u]=!0,e}var u=e.db_name+"-mrview-"+(i?"temp":Ke(a));return N(t,"_local/mrviews",s).then(function(){return t.registerDependentDatabase(u).then(function(e){var n=e.db;n.auto_compaction=!0;var s={name:u,db:n,sourceDB:t,adapter:t.adapter,mapFun:r,reduceFun:o};return s.db.get("_local/lastSeq")["catch"](function(e){if(404!==e.status)throw e}).then(function(e){return s.seq=e?e.seq:0,i||(t._cachedViews=t._cachedViews||{},t._cachedViews[a]=s,s.db.once("destroyed",function(){delete t._cachedViews[a]})),s})})})})}function fn(e,t,n,r,o,i){return wr("return ("+e.replace(/;\s*$/,"")+");",{emit:t,sum:n,log:r,isArray:o,toJSON:i})}function ln(e){return-1===e.indexOf("/")?[e,e]:e.split("/")}function dn(e){return 1===e.length&&/^1-/.test(e[0].rev)}function hn(e,t){try{e.emit("error",t)}catch(n){w("error","The user's map/reduce function threw an uncaught error.\nYou can debug this error by doing:\nmyDatabase.on('error', function (err) { debugger; });\nPlease double-check your map/reduce function."),w("error",t)}}function pn(e,t,n){try{return{output:t.apply(null,n)}}catch(r){return hn(e,r),{error:r}}}function vn(e,t){var n=kr.collate(e.key,t.key);return 0!==n?n:kr.collate(e.value,t.value)}function yn(e,t,n){return n=n||0,"number"==typeof t?e.slice(n,t+n):n>0?e.slice(n):e}function _n(e){var t=e.value,n=t&&"object"==typeof t&&t._id||e.id;return n}function mn(e){e.rows.forEach(function(e){var t=e.doc&&e.doc._attachments;t&&Object.keys(t).forEach(function(e){var n=t[e];t[e].data=Re(n.data,n.content_type)})})}function gn(e){return function(t){return e.include_docs&&e.attachments&&e.binary&&mn(t),t}}function bn(e){var t="builtin "+e+" function requires map values to be numbers or number arrays";return new Jn(t)}function wn(e){for(var t=0,n=0,r=e.length;r>n;n++){var o=e[n];if("number"!=typeof o){if(!Array.isArray(o))throw bn("_sum");t="number"==typeof t?[t]:t;for(var i=0,a=o.length;a>i;i++){var s=o[i];if("number"!=typeof s)throw bn("_sum");"undefined"==typeof t[i]?t.push(s):t[i]+=s}}else"number"==typeof t?t+=o:t[0]+=o}return t}function En(e,t,n,r){var o=t[e];"undefined"!=typeof o&&(r&&(o=encodeURIComponent(JSON.stringify(o))),n.push(e+"="+o))}function Sn(e){if("undefined"!=typeof e){var t=Number(e);return isNaN(t)||t!==parseInt(e,10)?e:t}}function kn(e){return e.group_level=Sn(e.group_level),e.limit=Sn(e.limit),e.skip=Sn(e.skip),e}function qn(e){if(e){if("number"!=typeof e)return new Hn('Invalid value for integer: "'+e+'"');if(0>e)return new Hn('Invalid value for positive integer: "'+e+'"')}}function xn(e,t){var n=e.descending?"endkey":"startkey",r=e.descending?"startkey":"endkey";if("undefined"!=typeof e[n]&&"undefined"!=typeof e[r]&&kr.collate(e[n],e[r])>0)throw new Hn("No rows can match your key range, reverse your start_key and end_key or set {descending : true}");if(t.reduce&&e.reduce!==!1){if(e.include_docs)throw new Hn("{include_docs:true} is invalid for reduce");if(e.keys&&e.keys.length>1&&!e.group&&!e.group_level)throw new Hn("Multi-key fetches for reduce views must use {group: true}")}["group_level","limit","skip"].forEach(function(t){var n=qn(e[t]);if(n)throw n})}function An(e,t,n){var r,o=[],i="GET";if(En("reduce",n,o),En("include_docs",n,o),En("attachments",n,o),En("limit",n,o),En("descending",n,o),En("group",n,o),En("group_level",n,o),En("skip",n,o),En("stale",n,o),En("conflicts",n,o),En("startkey",n,o,!0),En("start_key",n,o,!0),En("endkey",n,o,!0),En("end_key",n,o,!0),En("inclusive_end",n,o),En("key",n,o,!0),o=o.join("&"),o=""===o?"":"?"+o,"undefined"!=typeof n.keys){var a=2e3,s="keys="+encodeURIComponent(JSON.stringify(n.keys));s.length+o.length+1<=a?o+=("?"===o[0]?"&":"?")+s:(i="POST","string"==typeof t?r={keys:n.keys}:t.keys=n.keys)}if("string"==typeof t){var u=ln(t);return e.request({method:i,url:"_design/"+u[0]+"/_view/"+u[1]+o,body:r}).then(gn(n))}return r=r||{},Object.keys(t).forEach(function(e){Array.isArray(t[e])?r[e]=t[e]:r[e]=t[e].toString()}),e.request({method:"POST",url:"_temp_view"+o,body:r}).then(gn(n))}function Tn(e,t,n){return new qr(function(r,o){e._query(t,n,function(e,t){return e?o(e):void r(t)})})}function On(e){return new qr(function(t,n){e._viewCleanup(function(e,r){return e?n(e):void t(r)})})}function jn(e){return function(t){if(404===t.status)return e;throw t}}function Cn(e,t,n){function r(){return dn(f)?qr.resolve(s):t.db.get(a)["catch"](jn(s))}function o(e){return e.keys.length?t.db.allDocs({keys:e.keys,include_docs:!0}):qr.resolve({rows:[]})}function i(e,t){for(var n=[],r={},o=0,i=t.rows.length;i>o;o++){var a=t.rows[o],s=a.doc;if(s&&(n.push(s),r[s._id]=!0,s._deleted=!c[s._id],!s._deleted)){var u=c[s._id];"value"in u&&(s.value=u.value)}}var f=Object.keys(c);return f.forEach(function(e){if(!r[e]){var t={_id:e},o=c[e];"value"in o&&(t.value=o.value),n.push(t)}}),e.keys=oi(f.concat(e.keys)),n.push(e),n}var a="_local/doc_"+e,s={_id:a,keys:[]},u=n[e],c=u.indexableKeysToKeyValues,f=u.changes;return r().then(function(e){return o(e).then(function(t){return i(e,t)})})}function Ln(e,t,n){var r="_local/lastSeq";return e.db.get(r)["catch"](jn({_id:r,seq:0})).then(function(r){var o=Object.keys(t);return qr.all(o.map(function(n){return Cn(n,e,t)})).then(function(t){var o=j(t);return r.seq=n,o.push(r),e.db.bulkDocs({docs:o})})})}function In(e){var t="string"==typeof e?e:e.name,n=ii[t];return n||(n=ii[t]=new un),n}function Dn(e){return ri(In(e),function(){return Rn(e)})()}function Rn(e){function t(e,t){var n={id:o._id,key:kr.normalizeKey(e)};"undefined"!=typeof t&&null!==t&&(n.value=kr.normalizeKey(t)),r.push(n)}function n(t,n){return function(){return Ln(e,t,n)}}var r,o,i;if("function"==typeof e.mapFun&&2===e.mapFun.length){var a=e.mapFun;i=function(e){return a(e,t)}}else i=fn(e.mapFun.toString(),t,wn,ui,Array.isArray,JSON.parse);var s=e.seq||0,u=new un;return new qr(function(t,a){function c(){u.finish().then(function(){e.seq=s,t()})}function f(){function t(e){a(e)}e.sourceDB.changes({conflicts:!0,include_docs:!0,style:"all_docs",since:s,limit:si}).on("complete",function(t){var a=t.results;if(!a.length)return c();for(var l={},d=0,h=a.length;h>d;d++){var p=a[d];if("_"!==p.doc._id[0]){r=[],o=p.doc,o._deleted||pn(e.sourceDB,i,[o]),r.sort(vn);for(var v,y={},_=0,m=r.length;m>_;_++){var g=r[_],b=[g.key,g.id];0===kr.collate(g.key,v)&&b.push(_);var w=kr.toIndexableString(b);y[w]=g,v=g.key}l[p.doc._id]={indexableKeysToKeyValues:y,changes:p.changes}}s=p.seq}return u.add(n(l,s)),a.length<si?c():f()}).on("error",t)}f()})}function Nn(e,t,n){0===n.group_level&&delete n.group_level;var r,o=n.group||n.group_level;r=ci[e.reduceFun]?ci[e.reduceFun]:fn(e.reduceFun.toString(),null,wn,ui,Array.isArray,JSON.parse);var i=[],a=isNaN(n.group_level)?Number.POSITIVE_INFINITY:n.group_level;t.forEach(function(e){var t=i[i.length-1],n=o?e.key:null;return o&&Array.isArray(n)&&(n=n.slice(0,a)),t&&0===kr.collate(t.groupKey,n)?(t.keys.push([e.key,e.id]),void t.values.push(e.value)):void i.push({keys:[[e.key,e.id]],values:[e.value],groupKey:n})}),t=[];for(var s=0,u=i.length;u>s;s++){var c=i[s],f=pn(e.sourceDB,r,[c.keys,c.values,!1]);if(f.error&&f.error instanceof Jn)throw f.error;t.push({value:f.error?null:f.output,key:c.groupKey})}return{rows:yn(t,n.limit,n.skip)}}function Bn(e,t){return ri(In(e),function(){return Mn(e,t)})()}function Mn(e,t){function n(t){return t.include_docs=!0,e.db.allDocs(t).then(function(e){return o=e.total_rows,e.rows.map(function(e){if("value"in e.doc&&"object"==typeof e.doc.value&&null!==e.doc.value){var t=Object.keys(e.doc.value).sort(),n=["id","key","value"];if(!(n>t||t>n))return e.doc.value}var r=kr.parseIndexableString(e.doc._id);return{key:r[0],id:r[1],value:"value"in e.doc?e.doc.value:null}})})}function r(n){var r;if(r=i?Nn(e,n,t):{total_rows:o,offset:a,rows:n},t.include_docs){var s=oi(n.map(_n));return e.sourceDB.allDocs({keys:s,include_docs:!0,conflicts:t.conflicts,attachments:t.attachments,binary:t.binary}).then(function(e){var t={};return e.rows.forEach(function(e){e.doc&&(t["$"+e.id]=e.doc)}),n.forEach(function(e){var n=_n(e),r=t["$"+n];r&&(e.doc=r)}),r})}return r}var o,i=e.reduceFun&&t.reduce!==!1,a=t.skip||0;if("undefined"==typeof t.keys||t.keys.length||(t.limit=0,delete t.keys),"undefined"!=typeof t.keys){var s=t.keys,u=s.map(function(e){var t={startkey:kr.toIndexableString([e]),endkey:kr.toIndexableString([e,{}])};return n(t)});return qr.all(u).then(j).then(r)}var c={descending:t.descending};if(t.start_key&&(t.startkey=t.start_key),t.end_key&&(t.endkey=t.end_key),"undefined"!=typeof t.startkey&&(c.startkey=t.descending?kr.toIndexableString([t.startkey,{}]):kr.toIndexableString([t.startkey])),"undefined"!=typeof t.endkey){var f=t.inclusive_end!==!1;t.descending&&(f=!f),c.endkey=kr.toIndexableString(f?[t.endkey,{}]:[t.endkey])}if("undefined"!=typeof t.key){var l=kr.toIndexableString([t.key]),d=kr.toIndexableString([t.key,{}]);c.descending?(c.endkey=l,c.startkey=d):(c.startkey=l,c.endkey=d)}return i||("number"==typeof t.limit&&(c.limit=t.limit),c.skip=a),n(c).then(r)}function Fn(e){return e.request({method:"POST",url:"_view_cleanup"})}function Un(e){return e.get("_local/mrviews").then(function(t){var n={};Object.keys(t.views).forEach(function(e){var t=ln(e),r="_design/"+t[0],o=t[1];n[r]=n[r]||{},n[r][o]=!0});var r={keys:Object.keys(n),include_docs:!0};return e.allDocs(r).then(function(r){var o={};r.rows.forEach(function(e){var r=e.key.substring(8);Object.keys(n[e.key]).forEach(function(n){var i=r+"/"+n;t.views[i]||(i=n);var a=Object.keys(t.views[i]),s=e.doc&&e.doc.views&&e.doc.views[n];a.forEach(function(e){o[e]=o[e]||s})})});var i=Object.keys(o).filter(function(e){return!o[e]}),a=i.map(function(t){return ri(In(t),function(){return new e.constructor(t,e.__opts).destroy()})()});return qr.all(a).then(function(){return{ok:!0}})})},jn({ok:!0}))}function Pn(e,t,r){if("http"===e.type())return An(e,t,r);if("function"==typeof e._query)return Tn(e,t,r);if("string"!=typeof t){xn(r,t);var o={db:e,viewName:"temp_view/temp_view",map:t.map,reduce:t.reduce,temporary:!0};return ai.add(function(){return cn(o).then(function(e){function t(){return e.db.destroy()}return ni(Dn(e).then(function(){return Bn(e,r)}),t)})}),ai.finish()}var i=t,a=ln(i),s=a[0],u=a[1];return e.get("_design/"+s).then(function(t){var o=t.views&&t.views[u];if(!o||"string"!=typeof o.map)throw new Kn("ddoc "+s+" has no view named "+u);xn(r,o);var a={db:e,viewName:i,map:o.map,reduce:o.reduce};return cn(a).then(function(e){return"ok"===r.stale||"update_after"===r.stale?("update_after"===r.stale&&n.nextTick(function(){Dn(e)}),Bn(e,r)):Dn(e).then(function(){return Bn(e,r)})})})}function Hn(e){this.status=400,this.name="query_parse_error",this.message=e,this.error=!0;try{Error.captureStackTrace(this,Hn)}catch(t){}}function Kn(e){this.status=404,this.name="not_found",this.message=e,this.error=!0;try{Error.captureStackTrace(this,Kn)}catch(t){}}function Jn(e){this.status=500,this.name="invalid_value",this.message=e,this.error=!0;try{Error.captureStackTrace(this,Jn)}catch(t){}}function Wn(e){return/^1-/.test(e)}function zn(e,t,n){return!e._attachments||!e._attachments[n]||e._attachments[n].digest!==t._attachments[n].digest}function Xn(e,t){var n=Object.keys(t._attachments);return qr.all(n.map(function(n){return e.getAttachment(t._id,n,{rev:t._rev})}))}function Gn(e,t,n){var r="http"===t.type()&&"http"!==e.type(),o=Object.keys(n._attachments);return r?e.get(n._id).then(function(r){return qr.all(o.map(function(o){return zn(r,n,o)?t.getAttachment(n._id,o):e.getAttachment(r._id,o)}))})["catch"](function(e){if(404!==e.status)throw e;return Xn(t,n)}):Xn(t,n)}function Vn(e){var t=[];return Object.keys(e).forEach(function(n){var r=e[n].missing;r.forEach(function(e){t.push({id:n,rev:e})})}),{docs:t,revs:!0}}function Qn(e,t,n,r){function o(){var o=Vn(n);if(o.docs.length)return e.bulkGet(o).then(function(n){if(r.cancelled)throw new Error("cancelled");return qr.all(n.results.map(function(n){return qr.all(n.docs.map(function(n){var r=n.ok;return n.error&&(l=!1),r&&r._attachments?Gn(t,e,r).then(function(e){var t=Object.keys(r._attachments);return e.forEach(function(e,n){var o=r._attachments[t[n]];delete o.stub,delete o.length,o.data=e}),r}):r}))})).then(function(e){f=f.concat(j(e).filter(Boolean))})})}function i(e){return e._attachments&&Object.keys(e._attachments).length>0}function a(t){return e.allDocs({keys:t,include_docs:!0}).then(function(e){if(r.cancelled)throw new Error("cancelled");e.rows.forEach(function(e){!e.deleted&&e.doc&&Wn(e.value.rev)&&!i(e.doc)&&(f.push(e.doc),delete n[e.id])})})}function s(){var e=Object.keys(n).filter(function(e){var t=n[e].missing;return 1===t.length&&Wn(t[0])});return e.length>0?a(e):void 0}function u(){return{ok:l,docs:f}}n=c(n);var f=[],l=!0;return qr.resolve().then(s).then(o).then(u)}function $n(e,t,n,r,o){return e.get(t)["catch"](function(n){if(404===n.status)return"http"===e.type()&&k(404,"PouchDB is just checking if a remote checkpoint exists."),{session_id:r,_id:t,history:[],replicator:pi,version:hi};throw n}).then(function(i){return o.cancelled?void 0:(i.history=(i.history||[]).filter(function(e){return e.session_id!==r}),i.history.unshift({last_seq:n,session_id:r}),i.history=i.history.slice(0,vi),i.version=hi,i.replicator=pi,i.session_id=r,i.last_seq=n,e.put(i)["catch"](function(i){if(409===i.status)return $n(e,t,n,r,o);throw i}))})}function Yn(e,t,n,r){this.src=e,this.target=t,this.id=n,this.returnValue=r}function Zn(e,t){return e.session_id===t.session_id?{last_seq:e.last_seq,history:e.history}:er(e.history,t.history)}function er(e,t){var n=e[0],r=e.slice(1),o=t[0],i=t.slice(1);if(!n||0===t.length)return{last_seq:yi,history:[]};var a=n.session_id;if(tr(a,t))return{last_seq:n.last_seq,history:e};var s=o.session_id;return tr(s,r)?{last_seq:o.last_seq,history:i}:er(r,i)}function tr(e,t){var n=t[0],r=t.slice(1);return e&&0!==t.length?e===n.session_id?!0:tr(e,r):!1}function nr(e){return"number"==typeof e.status&&4===Math.floor(e.status/100)}function rr(e,t,n,r){return e.retry===!1?(t.emit("error",n),void t.removeAllListeners()):("function"!=typeof e.back_off_function&&(e.back_off_function=S),t.emit("requestError",n),"active"!==t.state&&"pending"!==t.state||(t.emit("paused",n),t.state="stopped",t.once("active",function(){e.current_back_off=mi})),e.current_back_off=e.current_back_off||mi,e.current_back_off=e.back_off_function(e.current_back_off),void setTimeout(r,e.current_back_off))}function or(e){return Object.keys(e).sort(kr.collate).reduce(function(t,n){return t[n]=e[n],t},{})}function ir(e,t,n){var r=n.doc_ids?n.doc_ids.sort(kr.collate):"",o=n.filter?n.filter.toString():"",i="",a="";return n.filter&&n.query_params&&(i=JSON.stringify(or(n.query_params))),n.filter&&"_view"===n.filter&&(a=n.view.toString()),qr.all([e.id(),t.id()]).then(function(e){var t=e[0]+e[1]+o+a+i+r;return new qr(function(e){He(t,e)})}).then(function(e){return e=e.replace(/\//g,".").replace(/\+/g,"_"),"_local/"+e})}function ar(e,t,n,r,o){function i(){return S?qr.resolve():ir(e,t,n).then(function(n){E=n,S=new Yn(e,t,E,r)})}function a(){if(B=[],0!==w.docs.length){var e=w.docs;return t.bulkDocs({docs:e,new_edits:!1}).then(function(t){if(r.cancelled)throw p(),new Error("cancelled");var n=[],i={};t.forEach(function(e){e.error&&(o.doc_write_failures++,n.push(e),i[e.id]=e)}),N=N.concat(n),o.docs_written+=w.docs.length-n.length;var a=n.filter(function(e){return"unauthorized"!==e.name&&"forbidden"!==e.name});if(e.forEach(function(e){var t=i[e._id];t?r.emit("denied",c(t)):B.push(e)}),a.length>0){var s=new Error("bulkDocs error");throw s.other_errors=n,h("target.bulkDocs failed to write docs",s),new Error("bulkWrite partial failure")}},function(t){throw o.doc_write_failures+=e.length,t})}}function s(){if(w.error)throw new Error("There was a problem getting docs.");o.last_seq=j=w.seq;var e=c(o);return B.length&&(e.docs=B,r.emit("change",e)),x=!0,S.writeCheckpoint(w.seq,M).then(function(){if(x=!1,r.cancelled)throw p(),new Error("cancelled");w=void 0,m()})["catch"](b)}function u(){var e={};return w.changes.forEach(function(t){"_user/"!==t.id&&(e[t.id]=t.changes.map(function(e){return e.rev}))}),t.revsDiff(e).then(function(e){if(r.cancelled)throw p(),new Error("cancelled");w.diffs=e})}function f(){return Qn(e,t,w.diffs,r).then(function(e){w.error=!e.ok,e.docs.forEach(function(e){delete w.diffs[e._id],o.docs_read++,w.docs.push(e)})})}function l(){if(!r.cancelled&&!w){if(0===k.length)return void d(!0);w=k.shift(),u().then(f).then(a).then(s).then(l)["catch"](function(e){h("batch processing terminated with error",e)})}}function d(e){return 0===q.changes.length?void(0!==k.length||w||((C&&U.live||A)&&(r.state="pending",r.emit("paused")),A&&p())):void((e||A||q.changes.length>=L)&&(k.push(q),q={seq:0,changes:[],docs:[]},"pending"!==r.state&&"stopped"!==r.state||(r.state="active",r.emit("active")),l()))}function h(e,t){T||(t.message||(t.message=e),o.ok=!1,o.status="aborting",o.errors.push(t),N=N.concat(t),k=[],q={seq:0,changes:[],docs:[]},p())}function p(){if(!(T||r.cancelled&&(o.status="cancelled",x))){o.status=o.status||"complete",o.end_time=new Date,o.last_seq=j,T=!0;var i=N.filter(function(e){return"unauthorized"!==e.name&&"forbidden"!==e.name});if(i.length>0){var a=N.pop();N.length>0&&(a.other_errors=N),a.result=o,rr(n,r,a,function(){ar(e,t,n,r)})}else o.errors=N,r.emit("complete",o),r.removeAllListeners()}}function v(e){if(r.cancelled)return p();var t=O(n)(e);t&&(q.seq=e.seq,q.changes.push(e),d(0===k.length&&U.live))}function y(e){if(D=!1,r.cancelled)return p();if(e.results.length>0)U.since=e.last_seq,m(),d(!0);else{var t=function(){C?(U.live=!0,m()):A=!0,d(!0)};w||0!==e.results.length?t():(x=!0,S.writeCheckpoint(e.last_seq,M).then(function(){x=!1,o.last_seq=j=e.last_seq,t()})["catch"](b))}}function _(e){return D=!1,r.cancelled?p():void h("changes rejected",e)}function m(){function t(){i.cancel()}function o(){r.removeListener("cancel",t)}if(!D&&!A&&k.length<I){D=!0,r._changes&&(r.removeListener("cancel",r._abortChanges),r._changes.cancel()),r.once("cancel",t);var i=e.changes(U).on("change",v);i.then(o,o),i.then(y)["catch"](_),n.retry&&(r._changes=i,r._abortChanges=t)}}function g(){i().then(function(){return r.cancelled?void p():S.getCheckpoint().then(function(e){j=e,U={since:j,limit:L,batch_size:L,style:"all_docs",doc_ids:R,return_docs:!0},n.filter&&("string"!=typeof n.filter?U.include_docs=!0:U.filter=n.filter),"heartbeat"in n&&(U.heartbeat=n.heartbeat),"timeout"in n&&(U.timeout=n.timeout),n.query_params&&(U.query_params=n.query_params),n.view&&(U.view=n.view),m()})})["catch"](function(e){h("getCheckpoint rejected with ",e)})}function b(e){throw x=!1,h("writeCheckpoint completed with error",e),e}var w,E,S,k=[],q={seq:0,changes:[],docs:[]},x=!1,A=!1,T=!1,j=0,C=n.continuous||n.live||!1,L=n.batch_size||100,I=n.batches_limit||10,D=!1,R=n.doc_ids,N=[],B=[],M=F();o=o||{ok:!0,start_time:new Date,docs_read:0,docs_written:0,doc_write_failures:0,errors:[]};var U={};return r.ready(e,t),r.cancelled?void p():(r._addedListeners||(r.once("cancel",p),"function"==typeof n.complete&&(r.once("error",n.complete),r.once("complete",function(e){n.complete(null,e)})),r._addedListeners=!0),void("undefined"==typeof n.since?g():i().then(function(){return x=!0,S.writeCheckpoint(n.since,M)}).then(function(){return x=!1,r.cancelled?void p():(j=n.since,void g())})["catch"](b)))}function sr(){br.EventEmitter.call(this),this.cancelled=!1,this.state="pending";var e=this,t=new qr(function(t,n){e.once("complete",t),e.once("error",n)});e.then=function(e,n){return t.then(e,n)},e["catch"]=function(e){return t["catch"](e)},e["catch"](function(){})}function ur(e,t){var n=t.PouchConstructor;return"string"==typeof e?new n(e,t):e}function cr(e,t,n,r){if("function"==typeof n&&(r=n,n={}),"undefined"==typeof n&&(n={}),n.doc_ids&&!Array.isArray(n.doc_ids))throw x(Jr,"`doc_ids` filter parameter is not a list.");n.complete=r,n=c(n),n.continuous=n.continuous||n.live,n.retry="retry"in n?n.retry:!1,n.PouchConstructor=n.PouchConstructor||this;var o=new sr(n),i=ur(e,n),a=ur(t,n);return ar(i,a,n,o),o}function fr(e,t,n,r){return"function"==typeof n&&(r=n,n={}),"undefined"==typeof n&&(n={}),n=c(n),n.PouchConstructor=n.PouchConstructor||this,e=ur(e,n),t=ur(t,n),new lr(e,t,n,r)}function lr(e,t,n,r){function o(e){h.emit("change",{direction:"pull",change:e})}function i(e){h.emit("change",{direction:"push",change:e})}function a(e){h.emit("denied",{direction:"push",doc:e})}function s(e){h.emit("denied",{direction:"pull",doc:e})}function u(){h.pushPaused=!0,h.pullPaused&&h.emit("paused")}function c(){h.pullPaused=!0,h.pushPaused&&h.emit("paused")}function f(){h.pushPaused=!1,h.pullPaused&&h.emit("active",{direction:"push"})}function l(){h.pullPaused=!1,h.pushPaused&&h.emit("active",{direction:"pull"})}function d(e){return function(t,n){var r="change"===t&&(n===o||n===i),d="denied"===t&&(n===s||n===a),p="paused"===t&&(n===c||n===u),v="active"===t&&(n===l||n===f);(r||d||p||v)&&(t in y||(y[t]={}),y[t][e]=!0,2===Object.keys(y[t]).length&&h.removeAllListeners(t))}}var h=this;this.canceled=!1;var p=n.push?pr.extend({},n,n.push):n,v=n.pull?pr.extend({},n,n.pull):n;this.push=cr(e,t,p),this.pull=cr(t,e,v),this.pushPaused=!0,this.pullPaused=!0;var y={};n.live&&(this.push.on("complete",h.pull.cancel.bind(h.pull)),this.pull.on("complete",h.push.cancel.bind(h.push))),this.on("newListener",function(e){"change"===e?(h.pull.on("change",o),h.push.on("change",i)):"denied"===e?(h.pull.on("denied",s),h.push.on("denied",a)):"active"===e?(h.pull.on("active",l),
h.push.on("active",f)):"paused"===e&&(h.pull.on("paused",c),h.push.on("paused",u))}),this.on("removeListener",function(e){"change"===e?(h.pull.removeListener("change",o),h.push.removeListener("change",i)):"denied"===e?(h.pull.removeListener("denied",s),h.push.removeListener("denied",a)):"active"===e?(h.pull.removeListener("active",l),h.push.removeListener("active",f)):"paused"===e&&(h.pull.removeListener("paused",c),h.push.removeListener("paused",u))}),this.pull.on("removeListener",d("pull")),this.push.on("removeListener",d("push"));var _=qr.all([this.push,this.pull]).then(function(e){var t={push:e[0],pull:e[1]};return h.emit("complete",t),r&&r(null,t),h.removeAllListeners(),t},function(e){if(h.cancel(),r?r(e):h.emit("error",e),h.removeAllListeners(),r)throw e});this.then=function(e,t){return _.then(e,t)},this["catch"]=function(e){return _["catch"](e)}}function dr(e){e.replicate=cr,e.sync=fr}var hr,pr=e(9),vr=o(e(5)),yr=o(e(8)),_r=o(e(10)),mr=e(14),gr=o(e(4)),br=e(1),wr=o(e(15)),Er=o(e(16)),Sr=o(e(17)),kr=e(12),qr="function"==typeof Promise?Promise:_r,xr=Function.prototype.toString,Ar=xr.call(Object),Tr=vr("pouchdb:api"),Or=6;if(_())hr=!1;else try{localStorage.setItem("_pouch_check_localstorage",1),hr=!!localStorage.getItem("_pouch_check_localstorage")}catch(jr){hr=!1}yr(b,br.EventEmitter),b.prototype.addListener=function(e,t,n,r){function o(){function e(){a=!1}if(i._listeners[t]){if(a)return void(a="waiting");a=!0;var s=h(r,["style","include_docs","attachments","conflicts","filter","doc_ids","view","since","query_params","binary"]);n.changes(s).on("change",function(e){e.seq>r.since&&!r.cancelled&&(r.since=e.seq,r.onChange(e))}).on("complete",function(){"waiting"===a&&setTimeout(function(){o()},0),a=!1}).on("error",e)}}if(!this._listeners[t]){var i=this,a=!1;this._listeners[t]=o,this.on(e,o)}},b.prototype.removeListener=function(e,t){t in this._listeners&&br.EventEmitter.prototype.removeListener.call(this,e,this._listeners[t])},b.prototype.notifyLocalWindows=function(e){_()?chrome.storage.local.set({dbName:e}):m()&&(localStorage[e]="a"===localStorage[e]?"b":"a")},b.prototype.notify=function(e){this.emit(e),this.notifyLocalWindows(e)},yr(q,Error),q.prototype.toString=function(){return JSON.stringify({status:this.status,name:this.name,message:this.message,reason:this.reason})};var Cr=new q({status:401,error:"unauthorized",reason:"Name or password is incorrect."}),Lr=new q({status:400,error:"bad_request",reason:"Missing JSON list of 'docs'"}),Ir=new q({status:404,error:"not_found",reason:"missing"}),Dr=new q({status:409,error:"conflict",reason:"Document update conflict"}),Rr=new q({status:400,error:"invalid_id",reason:"_id field must contain a string"}),Nr=new q({status:412,error:"missing_id",reason:"_id is required for puts"}),Br=new q({status:400,error:"bad_request",reason:"Only reserved document ids may start with underscore."}),Mr=new q({status:412,error:"precondition_failed",reason:"Database not open"}),Fr=new q({status:500,error:"unknown_error",reason:"Database encountered an unknown error"}),Ur=new q({status:500,error:"badarg",reason:"Some query argument is invalid"}),Pr=new q({status:400,error:"invalid_request",reason:"Request was invalid"}),Hr=new q({status:400,error:"query_parse_error",reason:"Some query parameter is invalid"}),Kr=new q({status:500,error:"doc_validation",reason:"Bad special document member"}),Jr=new q({status:400,error:"bad_request",reason:"Something wrong with the request"}),Wr=new q({status:400,error:"bad_request",reason:"Document must be a JSON object"}),zr=new q({status:404,error:"not_found",reason:"Database not found"}),Xr=new q({status:500,error:"indexed_db_went_bad",reason:"unknown"}),Gr=new q({status:500,error:"web_sql_went_bad",reason:"unknown"}),Vr=new q({status:500,error:"levelDB_went_went_bad",reason:"unknown"}),Qr=new q({status:403,error:"forbidden",reason:"Forbidden by design doc validate_doc_update function"}),$r=new q({status:400,error:"bad_request",reason:"Invalid rev format"}),Yr=new q({status:412,error:"file_exists",reason:"The database could not be created, the file already exists."}),Zr=new q({status:412,error:"missing_stub"}),eo=new q({status:413,error:"invalid_url",reason:"Provided URL is invalid"}),to=[Cr,Lr,Ir,Dr,Rr,Nr,Br,Mr,Fr,Ur,Pr,Hr,Kr,Jr,Wr,zr,Gr,Vr,Qr,$r,Yr,Zr,Xr,eo],no=function(e,t,n){var r=to.filter(function(n){return n[e]===t});return n&&r.filter(function(e){return e.message===n})[0]||r[0]},ro=["source","protocol","authority","userInfo","user","password","host","port","relative","path","directory","file","query","anchor"],oo="queryKey",io=/(?:^|&)([^&=]*)=?([^&]*)/g,ao=/^(?:(?![^:@]+:[^:@\/]*@)([^:\/?#.]+):)?(?:\/\/)?((?:(([^:@]*)(?::([^:@]*))?)?@)?([^:\/?#]*)(?::(\d*))?)(((\/(?:[^?#](?![^?#\/]*\.[^?#\/.]+(?:[?#]|$)))*\/?)?([^?#\/]*))(?:\?([^#]*))?(?:#(.*))?)/,so="0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz".split("");yr(ce,br.EventEmitter),ce.prototype.cancel=function(){this.isCancelled=!0,this.db.taskqueue.isReady&&this.emit("cancel")},ce.prototype.doChanges=function(e){var t=this,n=e.complete;if(e=c(e),"live"in e&&!("continuous"in e)&&(e.continuous=e.live),e.processChange=fe,"latest"===e.since&&(e.since="now"),e.since||(e.since=0),"now"===e.since)return void this.db.info().then(function(r){return t.isCancelled?void n(null,{status:"cancelled"}):(e.since=r.update_seq,void t.doChanges(e))},n);if(e.continuous&&"now"!==e.since&&this.db.info().then(function(e){t.startSeq=e.update_seq},function(e){if("idbNull"!==e.id)throw e}),e.view&&!e.filter&&(e.filter="_view"),e.filter&&"string"==typeof e.filter&&("_view"===e.filter?e.view=D(e.view):e.filter=D(e.filter),"http"!==this.db.type()&&!e.doc_ids))return this.filterChanges(e);"descending"in e||(e.descending=!1),e.limit=0===e.limit?1:e.limit,e.complete=n;var r=this.db._changes(e);if(r&&"function"==typeof r.cancel){var o=t.cancel;t.cancel=gr(function(e){r.cancel(),o.apply(this,e)})}},ce.prototype.filterChanges=function(e){var t=this,n=e.complete;if("_view"===e.filter){if(!e.view||"string"!=typeof e.view){var r=x(Jr,"`view` filter parameter not found or invalid.");return n(r)}var o=I(e.view);this.db.get("_design/"+o[0],function(r,i){if(t.isCancelled)return n(null,{status:"cancelled"});if(r)return n(A(r));var a=i&&i.views&&i.views[o[1]]&&i.views[o[1]].map;return a?(e.filter=se(a),void t.doChanges(e)):n(x(Ir,i.views?"missing json key: "+o[1]:"missing json key: views"))})}else{var i=I(e.filter);if(!i)return t.doChanges(e);this.db.get("_design/"+i[0],function(r,o){if(t.isCancelled)return n(null,{status:"cancelled"});if(r)return n(A(r));var a=o&&o.filters&&o.filters[i[1]];return a?(e.filter=ae(a),void t.doChanges(e)):n(x(Ir,o&&o.filters?"missing json key: "+i[1]:"missing json key: filters"))})}},yr(be,br.EventEmitter),be.prototype.post=d("post",function(e,t,n){return"function"==typeof t&&(n=t,t={}),"object"!=typeof e||Array.isArray(e)?n(x(Wr)):void this.bulkDocs({docs:[e]},t,he(n))}),be.prototype.put=d("put",gr(function(e){function t(){a||(w("warn","db.put(doc, id, rev) has been deprecated and will be removed in a future release, please use db.put({_id: id, _rev: rev}) instead"),a=!0)}var n,r,o,i,a=!1,s=e.shift(),u="_id"in s;if("object"!=typeof s||Array.isArray(s))return(i=e.pop())(x(Wr));for(;;)if(n=e.shift(),r=typeof n,"string"!==r||u?"string"!==r||!u||"_rev"in s?"object"===r?o=n:"function"===r&&(i=n):(t(),s._rev=n):(t(),s._id=n,u=!0),!e.length)break;return o=o||{},C(s._id),ie(s._id)&&"function"==typeof this._putLocal?s._deleted?this._removeLocal(s,i):this._putLocal(s,i):void this.bulkDocs({docs:[s]},o,he(i))})),be.prototype.putAttachment=d("putAttachment",function(e,t,n,r,o){function i(e){var n="_rev"in e?parseInt(e._rev,10):0;return e._attachments=e._attachments||{},e._attachments[t]={content_type:o,data:r,revpos:++n},a.put(e)}var a=this;return"function"==typeof o&&(o=r,r=n,n=null),"undefined"==typeof o&&(o=r,r=n,n=null),a.get(e).then(function(e){if(e._rev!==n)throw x(Dr);return i(e)},function(t){if(t.reason===Ir.message)return i({_id:e});throw t})}),be.prototype.removeAttachment=d("removeAttachment",function(e,t,n,r){var o=this;o.get(e,function(e,i){return e?void r(e):i._rev!==n?void r(x(Dr)):i._attachments?(delete i._attachments[t],0===Object.keys(i._attachments).length&&delete i._attachments,void o.put(i,r)):r()})}),be.prototype.remove=d("remove",function(e,t,n,r){var o;"string"==typeof t?(o={_id:e,_rev:t},"function"==typeof n&&(r=n,n={})):(o=e,"function"==typeof t?(r=t,n={}):(r=n,n=t)),n=n||{},n.was_delete=!0;var i={_id:o._id,_rev:o._rev||n.rev};return i._deleted=!0,ie(i._id)&&"function"==typeof this._removeLocal?this._removeLocal(o,r):void this.bulkDocs({docs:[i]},n,he(r))}),be.prototype.revsDiff=d("revsDiff",function(e,t,n){function r(e,t){s.has(e)||s.set(e,{missing:[]}),s.get(e).missing.push(t)}function o(t,n){var o=e[t].slice(0);P(n,function(e,n,i,a,s){var u=n+"-"+i,c=o.indexOf(u);-1!==c&&(o.splice(c,1),"available"!==s.status&&r(t,u))}),o.forEach(function(e){r(t,e)})}"function"==typeof t&&(n=t,t={});var i=Object.keys(e);if(!i.length)return n(null,{});var a=0,s=new mr.Map;i.map(function(t){this._getRevisionTree(t,function(r,u){if(r&&404===r.status&&"missing"===r.message)s.set(t,{missing:e[t]});else{if(r)return n(r);o(t,u)}if(++a===i.length){var c={};return s.forEach(function(e,t){c[t]=e}),n(null,c)}})},this)}),be.prototype.bulkGet=d("bulkGet",function(e,t){y(this,e,t)}),be.prototype.compactDocument=d("compactDocument",function(e,t,n){var r=this;this._getRevisionTree(e,function(o,i){if(o)return n(o);var a=ye(i),s=[],u=[];Object.keys(a).forEach(function(e){a[e]>t&&s.push(e)}),P(i,function(e,t,n,r,o){var i=t+"-"+n;"available"===o.status&&-1!==s.indexOf(i)&&u.push(i)}),r._doCompaction(e,u,n)})}),be.prototype.compact=d("compact",function(e,t){"function"==typeof e&&(t=e,e={});var n=this;e=e||{},n._compactionQueue=n._compactionQueue||[],n._compactionQueue.push({opts:e,callback:t}),1===n._compactionQueue.length&&me(n)}),be.prototype._compact=function(e,t){function n(e){a.push(o.compactDocument(e.id,0))}function r(e){var n=e.last_seq;qr.all(a).then(function(){return N(o,"_local/compaction",function(e){return!e.last_seq||e.last_seq<n?(e.last_seq=n,e):!1})}).then(function(){t(null,{ok:!0})})["catch"](t)}var o=this,i={return_docs:!1,last_seq:e.last_seq||0},a=[];o.changes(i).on("change",n).on("complete",r).on("error",t)},be.prototype.get=d("get",function(e,t,n){function r(){var r=[],a=o.length;return a?void o.forEach(function(o){i.get(e,{rev:o,revs:t.revs,attachments:t.attachments},function(e,t){e?r.push({missing:o}):r.push({ok:t}),a--,a||n(null,r)})}):n(null,r)}if("function"==typeof t&&(n=t,t={}),"string"!=typeof e)return n(x(Rr));if(ie(e)&&"function"==typeof this._getLocal)return this._getLocal(e,n);var o=[],i=this;if(!t.open_revs)return this._get(e,t,function(e,r){if(e)return n(e);var o=r.doc,a=r.metadata,s=r.ctx;if(t.conflicts){var u=J(a);u.length&&(o._conflicts=u)}if(oe(a,o._rev)&&(o._deleted=!0),t.revs||t.revs_info){var c=z(a.rev_tree),f=de(c,function(e){return-1!==e.ids.map(function(e){return e.id}).indexOf(o._rev.split("-")[1])}),l=f.ids.map(function(e){return e.id}).indexOf(o._rev.split("-")[1])+1,d=f.ids.length-l;if(f.ids.splice(l,d),f.ids.reverse(),t.revs&&(o._revisions={start:f.pos+f.ids.length-1,ids:f.ids.map(function(e){return e.id})}),t.revs_info){var h=f.pos+f.ids.length;o._revs_info=f.ids.map(function(e){return h--,{rev:h+"-"+e.id,status:e.opts.status}})}}if(t.attachments&&o._attachments){var p=o._attachments,v=Object.keys(p).length;if(0===v)return n(null,o);Object.keys(p).forEach(function(e){this._getAttachment(o._id,e,p[e],{rev:o._rev,binary:t.binary,ctx:s},function(t,r){var i=o._attachments[e];i.data=r,delete i.stub,delete i.length,--v||n(null,o)})},i)}else{if(o._attachments)for(var y in o._attachments)o._attachments.hasOwnProperty(y)&&(o._attachments[y].stub=!0);n(null,o)}});if("all"===t.open_revs)this._getRevisionTree(e,function(e,t){return e?n(e):(o=K(t).map(function(e){return e.rev}),void r())});else{if(!Array.isArray(t.open_revs))return n(x(Fr,"function_clause"));o=t.open_revs;for(var a=0;a<o.length;a++){var s=o[a];if("string"!=typeof s||!/^\d+-/.test(s))return n(x($r))}r()}}),be.prototype.getAttachment=d("getAttachment",function(e,t,n,r){var o=this;n instanceof Function&&(r=n,n={}),this._get(e,n,function(i,a){return i?r(i):a.doc._attachments&&a.doc._attachments[t]?(n.ctx=a.ctx,n.binary=!0,o._getAttachment(e,t,a.doc._attachments[t],n,r),void 0):r(x(Ir))})}),be.prototype.allDocs=d("allDocs",function(e,t){if("function"==typeof e&&(t=e,e={}),e.skip="undefined"!=typeof e.skip?e.skip:0,e.start_key&&(e.startkey=e.start_key),e.end_key&&(e.endkey=e.end_key),"keys"in e){if(!Array.isArray(e.keys))return t(new TypeError("options.keys must be an array"));var n=["startkey","endkey","key"].filter(function(t){return t in e})[0];if(n)return void t(x(Hr,"Query parameter `"+n+"` is not compatible with multi-get"));if("http"!==this.type())return _e(this,e,t)}return this._allDocs(e,t)}),be.prototype.changes=function(e,t){return"function"==typeof e&&(t=e,e={}),new ce(this,e,t)},be.prototype.close=d("close",function(e){return this._closed=!0,this._close(e)}),be.prototype.info=d("info",function(e){var t=this;this._info(function(n,r){return n?e(n):(r.db_name=r.db_name||t._db_name,r.auto_compaction=!(!t.auto_compaction||"http"===t.type()),r.adapter=t.type(),void e(null,r))})}),be.prototype.id=d("id",function(e){return this._id(e)}),be.prototype.type=function(){return"function"==typeof this._type?this._type():this.adapter},be.prototype.bulkDocs=d("bulkDocs",function(e,t,n){if("function"==typeof t&&(n=t,t={}),t=t||{},Array.isArray(e)&&(e={docs:e}),!e||!e.docs||!Array.isArray(e.docs))return n(x(Lr));for(var r=0;r<e.docs.length;++r)if("object"!=typeof e.docs[r]||Array.isArray(e.docs[r]))return n(x(Wr));var o;return e.docs.forEach(function(e){e._attachments&&Object.keys(e._attachments).forEach(function(e){o=o||ge(e)})}),o?n(x(Jr,o)):("new_edits"in t||("new_edits"in e?t.new_edits=e.new_edits:t.new_edits=!0),t.new_edits||"http"===this.type()||e.docs.sort(ve),pe(e.docs),this._bulkDocs(e,t,function(e,r){return e?n(e):(t.new_edits||(r=r.filter(function(e){return e.error})),void n(null,r))}))}),be.prototype.registerDependentDatabase=d("registerDependentDatabase",function(e,t){function n(t){return t.dependentDbs=t.dependentDbs||{},t.dependentDbs[e]?!1:(t.dependentDbs[e]=!0,t)}var r=new this.constructor(e,this.__opts);N(this,"_local/_pouch_dependentDbs",n).then(function(){t(null,{db:r})})["catch"](t)}),be.prototype.destroy=d("destroy",function(e,t){function n(){r._destroy(e,function(e,n){return e?t(e):(r._destroyed=!0,r.emit("destroyed"),void t(null,n||{ok:!0}))})}"function"==typeof e&&(t=e,e={});var r=this,o="use_prefix"in r?r.use_prefix:!0;return"http"===r.type()?n():void r.get("_local/_pouch_dependentDbs",function(e,i){if(e)return 404!==e.status?t(e):n();var a=i.dependentDbs,s=r.constructor,u=Object.keys(a).map(function(e){var t=o?e.replace(new RegExp("^"+s.prefix),""):e;return new s(t,r.__opts).destroy()});qr.all(u).then(n,t)})}),we.prototype.execute=function(){var e;if(this.failed)for(;e=this.queue.shift();)e(this.failed);else for(;e=this.queue.shift();)e()},we.prototype.fail=function(e){this.failed=e,this.execute()},we.prototype.ready=function(e){this.isReady=!0,this.db=e,this.execute()},we.prototype.addTask=function(e){this.queue.push(e),this.failed&&this.execute()},yr(ke,be),ke.debug=vr,ke.adapters={},ke.preferredAdapters=[],ke.prefix="_pouch_";var uo=new br.EventEmitter;qe(ke),ke.parseAdapter=function(e,t){var n,r,o=e.match(/([a-z\-]*):\/\/(.*)/);if(o){if(e=/http(s?)/.test(o[1])?o[1]+"://"+o[2]:o[2],n=o[1],!ke.adapters[n].valid())throw"Invalid adapter";return{name:e,adapter:o[1]}}var i="idb"in ke.adapters&&"websql"in ke.adapters&&m()&&localStorage["_pouch__websqldb_"+ke.prefix+e];if(t.adapter)r=t.adapter;else if("undefined"!=typeof t&&t.db)r="leveldb";else for(var a=0;a<ke.preferredAdapters.length;++a)if(r=ke.preferredAdapters[a],r in ke.adapters){if(i&&"idb"===r){w("log",'PouchDB is downgrading "'+e+'" to WebSQL to avoid data loss, because it was already opened with WebSQL.');continue}break}n=ke.adapters[r];var s=n&&"use_prefix"in n?n.use_prefix:!0;return{name:s?ke.prefix+e:e,adapter:r}},ke.adapter=function(e,t,n){t.valid()&&(ke.adapters[e]=t,n&&ke.preferredAdapters.push(e))},ke.plugin=function(e){return"function"==typeof e?e(ke):Object.keys(e).forEach(function(t){ke.prototype[t]=e[t]}),ke},ke.defaults=function(e){function t(n,r,o){return this instanceof t?("function"!=typeof r&&"undefined"!=typeof r||(o=r,r={}),n&&"object"==typeof n&&(r=n,n=void 0),r=pr.extend({},e,r),void ke.call(this,n,r,o)):new t(n,r,o)}return yr(t,ke),t.preferredAdapters=ke.preferredAdapters.slice(),Object.keys(ke).forEach(function(e){e in t||(t[e]=ke[e])}),t};var co="5.4.4";ke.version=co;var fo,lo=xe(["_id","_rev","_attachments","_deleted","_revisions","_revs_info","_conflicts","_deleted_conflicts","_local_seq","_rev_tree","_replication_id","_replication_state","_replication_state_time","_replication_state_reason","_replication_stats","_removed"]),ho=xe(["_attachments","_replication_id","_replication_state","_replication_state_time","_replication_state_reason","_replication_stats"]),po=function(e){return atob(e)},vo=function(e){return btoa(e)},yo=r.setImmediate||r.setTimeout,_o=32768,mo=5,go="document-store",bo="by-sequence",wo="attach-store",Eo="attach-seq-store",So="meta-store",ko="local-store",qo="detect-blob-support",xo={running:!1,queue:[]},Ao=new mr.Map,To=new b,Oo=new mr.Map;ht.valid=function(){var e="undefined"!=typeof openDatabase&&/(Safari|iPhone|iPad|iPod)/.test(navigator.userAgent)&&!/Chrome/.test(navigator.userAgent)&&!/BlackBerry/.test(navigator.platform);return!e&&"undefined"!=typeof indexedDB&&"undefined"!=typeof IDBKeyRange};var jo=7,Co=Et("document-store"),Lo=Et("by-sequence"),Io=Et("attach-store"),Do=Et("local-store"),Ro=Et("metadata-store"),No=Et("attach-seq-store"),Bo=new mr.Map,Mo=new b,Fo=1,Uo="CREATE INDEX IF NOT EXISTS 'by-seq-deleted-idx' ON "+Lo+" (seq, deleted)",Po="CREATE UNIQUE INDEX IF NOT EXISTS 'by-seq-doc-id-rev' ON "+Lo+" (doc_id, rev)",Ho="CREATE INDEX IF NOT EXISTS 'doc-winningseq-idx' ON "+Co+" (winningseq)",Ko="CREATE INDEX IF NOT EXISTS 'attach-seq-seq-idx' ON "+No+" (seq)",Jo="CREATE UNIQUE INDEX IF NOT EXISTS 'attach-seq-digest-idx' ON "+No+" (digest, seq)",Wo=Lo+".seq = "+Co+".winningseq",zo=Lo+".seq AS seq, "+Lo+".deleted AS deleted, "+Lo+".json AS data, "+Lo+".rev AS rev, "+Co+".json AS metadata";Ht.valid=Ut,Ht.use_prefix=!0;var Xo=Xt(),Go=function(){},Vo=25,Qo=50,$o={},Yo=1800,Zo=vr("pouchdb:http");an.valid=function(){return!0},un.prototype.add=function(e){return this.promise=this.promise["catch"](function(){}).then(function(){return e()}),this.promise},un.prototype.finish=function(){return this.promise};var ei=function(e,t){return t&&e.then(function(e){n.nextTick(function(){t(null,e)})},function(e){n.nextTick(function(){t(e)})}),e},ti=function(e){return gr(function(t){var n=t.pop(),r=e.apply(this,t);return"function"==typeof n&&ei(r,n),r})},ni=function(e,t){return e.then(function(e){return t().then(function(){return e})},function(e){return t().then(function(){throw e})})},ri=function(e,t){return function(){var n=arguments,r=this;return e.add(function(){return t.apply(r,n)})}},oi=function(e){for(var t={},n=0,r=e.length;r>n;n++)t["$"+e[n]]=!0;var o=Object.keys(t),i=new Array(o.length);for(n=0,r=o.length;r>n;n++)i[n]=o[n].substring(1);return i},ii={},ai=new un,si=50,ui=w.bind(null,"log"),ci={_sum:function(e,t){return wn(t)},_count:function(e,t){return t.length},_stats:function(e,t){function n(e){for(var t=0,n=0,r=e.length;r>n;n++){var o=e[n];t+=o*o}return t}return{sum:wn(t),min:Math.min.apply(null,t),max:Math.max.apply(null,t),count:t.length,sumsqr:n(t)}}},fi=ti(function(){var e=this;return"http"===e.type()?Fn(e):"function"==typeof e._viewCleanup?On(e):Un(e)}),li=function(e,t,n){"function"==typeof t&&(n=t,t={}),t=t?kn(t):{},"function"==typeof e&&(e={map:e});var r=this,o=qr.resolve().then(function(){return Pn(r,e,t)});return ei(o,n),o};yr(Hn,Error),yr(Kn,Error),yr(Jn,Error);var di={query:li,viewCleanup:fi},hi=1,pi="pouchdb",vi=5,yi=0;Yn.prototype.writeCheckpoint=function(e,t){var n=this;return this.updateTarget(e,t).then(function(){return n.updateSource(e,t)})},Yn.prototype.updateTarget=function(e,t){return $n(this.target,this.id,e,t,this.returnValue)},Yn.prototype.updateSource=function(e,t){var n=this;return this.readOnlySource?qr.resolve(!0):$n(this.src,this.id,e,t,this.returnValue)["catch"](function(e){if(nr(e))return n.readOnlySource=!0,!0;throw e})};var _i={undefined:function(e,t){return 0===kr.collate(e.last_seq,t.last_seq)?t.last_seq:0},1:function(e,t){return Zn(t,e).last_seq}};Yn.prototype.getCheckpoint=function(){var e=this;return e.target.get(e.id).then(function(t){return e.readOnlySource?qr.resolve(t.last_seq):e.src.get(e.id).then(function(e){if(t.version!==e.version)return yi;var n;return n=t.version?t.version.toString():"undefined",n in _i?_i[n](t,e):yi},function(n){if(404===n.status&&t.last_seq)return e.src.put({_id:e.id,last_seq:yi}).then(function(){return yi},function(n){return nr(n)?(e.readOnlySource=!0,t.last_seq):yi});throw n})})["catch"](function(e){if(404!==e.status)throw e;return yi})};var mi=0;yr(sr,br.EventEmitter),sr.prototype.cancel=function(){this.cancelled=!0,this.state="cancelled",this.emit("cancel")},sr.prototype.ready=function(e,t){function n(){o.cancel()}function r(){e.removeListener("destroyed",n),t.removeListener("destroyed",n)}var o=this;o._readyCalled||(o._readyCalled=!0,e.once("destroyed",n),t.once("destroyed",n),o.once("complete",r))},yr(lr,br.EventEmitter),lr.prototype.cancel=function(){this.canceled||(this.canceled=!0,this.push.cancel(),this.pull.cancel())},ke.plugin(yt).plugin(Kt).plugin(sn).plugin(di).plugin(dr),t.exports=ke}).call(this,e(2),"undefined"!=typeof global?global:"undefined"!=typeof self?self:"undefined"!=typeof window?window:{})},{1:1,10:10,12:12,14:14,15:15,16:16,17:17,2:2,4:4,5:5,8:8,9:9}],4:[function(e,t,n){"use strict";function r(e){return function(){var t=arguments.length;if(t){for(var n=[],r=-1;++r<t;)n[r]=arguments[r];return e.call(this,n)}return e.call(this,[])}}t.exports=r},{}],5:[function(e,t,n){function r(){return"WebkitAppearance"in document.documentElement.style||window.console&&(console.firebug||console.exception&&console.table)||navigator.userAgent.toLowerCase().match(/firefox\/(\d+)/)&&parseInt(RegExp.$1,10)>=31}function o(){var e=arguments,t=this.useColors;if(e[0]=(t?"%c":"")+this.namespace+(t?" %c":" ")+e[0]+(t?"%c ":" ")+"+"+n.humanize(this.diff),!t)return e;var r="color: "+this.color;e=[e[0],r,"color: inherit"].concat(Array.prototype.slice.call(e,1));var o=0,i=0;return e[0].replace(/%[a-z%]/g,function(e){"%%"!==e&&(o++,"%c"===e&&(i=o))}),e.splice(i,0,r),e}function i(){return"object"==typeof console&&console.log&&Function.prototype.apply.call(console.log,console,arguments)}function a(e){try{null==e?n.storage.removeItem("debug"):n.storage.debug=e}catch(t){}}function s(){var e;try{e=n.storage.debug}catch(t){}return e}function u(){try{return window.localStorage}catch(e){}}n=t.exports=e(6),n.log=i,n.formatArgs=o,n.save=a,n.load=s,n.useColors=r,n.storage="undefined"!=typeof chrome&&"undefined"!=typeof chrome.storage?chrome.storage.local:u(),n.colors=["lightseagreen","forestgreen","goldenrod","dodgerblue","darkorchid","crimson"],n.formatters.j=function(e){return JSON.stringify(e)},n.enable(s())},{6:6}],6:[function(e,t,n){function r(){return n.colors[f++%n.colors.length]}function o(e){function t(){}function o(){var e=o,t=+new Date,i=t-(c||t);e.diff=i,e.prev=c,e.curr=t,c=t,null==e.useColors&&(e.useColors=n.useColors()),null==e.color&&e.useColors&&(e.color=r());var a=Array.prototype.slice.call(arguments);a[0]=n.coerce(a[0]),"string"!=typeof a[0]&&(a=["%o"].concat(a));var s=0;a[0]=a[0].replace(/%([a-z%])/g,function(t,r){if("%%"===t)return t;s++;var o=n.formatters[r];if("function"==typeof o){var i=a[s];t=o.call(e,i),a.splice(s,1),s--}return t}),"function"==typeof n.formatArgs&&(a=n.formatArgs.apply(e,a));var u=o.log||n.log||console.log.bind(console);u.apply(e,a)}t.enabled=!1,o.enabled=!0;var i=n.enabled(e)?o:t;return i.namespace=e,i}function i(e){n.save(e);for(var t=(e||"").split(/[\s,]+/),r=t.length,o=0;r>o;o++)t[o]&&(e=t[o].replace(/\*/g,".*?"),"-"===e[0]?n.skips.push(new RegExp("^"+e.substr(1)+"$")):n.names.push(new RegExp("^"+e+"$")))}function a(){n.enable("")}function s(e){var t,r;for(t=0,r=n.skips.length;r>t;t++)if(n.skips[t].test(e))return!1;for(t=0,r=n.names.length;r>t;t++)if(n.names[t].test(e))return!0;return!1}function u(e){return e instanceof Error?e.stack||e.message:e}n=t.exports=o,n.coerce=u,n.disable=a,n.enable=i,n.enabled=s,n.humanize=e(11),n.names=[],n.skips=[],n.formatters={};var c,f=0},{11:11}],7:[function(e,t,n){(function(e){"use strict";function n(){f=!0;for(var e,t,n=l.length;n;){for(t=l,l=[],e=-1;++e<n;)t[e]();n=l.length}f=!1}function r(e){1!==l.push(e)||f||o()}var o,i=e.MutationObserver||e.WebKitMutationObserver;if(i){var a=0,s=new i(n),u=e.document.createTextNode("");s.observe(u,{characterData:!0}),o=function(){u.data=a=++a%2}}else if(e.setImmediate||"undefined"==typeof e.MessageChannel)o="document"in e&&"onreadystatechange"in e.document.createElement("script")?function(){var t=e.document.createElement("script");t.onreadystatechange=function(){n(),t.onreadystatechange=null,t.parentNode.removeChild(t),t=null},e.document.documentElement.appendChild(t)}:function(){setTimeout(n,0)};else{var c=new e.MessageChannel;c.port1.onmessage=n,o=function(){c.port2.postMessage(0)}}var f,l=[];t.exports=r}).call(this,"undefined"!=typeof global?global:"undefined"!=typeof self?self:"undefined"!=typeof window?window:{})},{}],8:[function(e,t,n){"function"==typeof Object.create?t.exports=function(e,t){e.super_=t,e.prototype=Object.create(t.prototype,{constructor:{value:e,enumerable:!1,writable:!0,configurable:!0}})}:t.exports=function(e,t){e.super_=t;var n=function(){};n.prototype=t.prototype,e.prototype=new n,e.prototype.constructor=e}},{}],9:[function(e,t,n){(function(){var e=Array.prototype.slice,t=Array.prototype.forEach,n=function(r){if("object"!=typeof r)throw r+" is not an object";var o=e.call(arguments,1);return t.call(o,function(e){if(e)for(var t in e)"object"==typeof e[t]&&r[t]?n.call(r,r[t],e[t]):r[t]=e[t]}),r};this.extend=n}).call(this)},{}],10:[function(e,t,n){"use strict";function r(){}function o(e){if("function"!=typeof e)throw new TypeError("resolver must be a function");this.state=m,this.queue=[],this.outcome=void 0,e!==r&&u(this,e)}function i(e,t,n){this.promise=e,"function"==typeof t&&(this.onFulfilled=t,this.callFulfilled=this.otherCallFulfilled),"function"==typeof n&&(this.onRejected=n,this.callRejected=this.otherCallRejected)}function a(e,t,n){p(function(){var r;try{r=t(n)}catch(o){return v.reject(e,o)}r===e?v.reject(e,new TypeError("Cannot resolve promise with itself")):v.resolve(e,r)})}function s(e){var t=e&&e.then;return e&&"object"==typeof e&&"function"==typeof t?function(){t.apply(e,arguments)}:void 0}function u(e,t){function n(t){i||(i=!0,v.reject(e,t))}function r(t){i||(i=!0,v.resolve(e,t))}function o(){t(r,n)}var i=!1,a=c(o);"error"===a.status&&n(a.value)}function c(e,t){var n={};try{n.value=e(t),n.status="success"}catch(r){n.status="error",n.value=r}return n}function f(e){return e instanceof this?e:v.resolve(new this(r),e)}function l(e){var t=new this(r);return v.reject(t,e)}function d(e){function t(e,t){function r(e){a[t]=e,++s!==o||i||(i=!0,v.resolve(c,a))}n.resolve(e).then(r,function(e){i||(i=!0,v.reject(c,e))})}var n=this;if("[object Array]"!==Object.prototype.toString.call(e))return this.reject(new TypeError("must be an array"));var o=e.length,i=!1;if(!o)return this.resolve([]);for(var a=new Array(o),s=0,u=-1,c=new this(r);++u<o;)t(e[u],u);return c}function h(e){function t(e){n.resolve(e).then(function(e){i||(i=!0,v.resolve(s,e))},function(e){i||(i=!0,v.reject(s,e))})}var n=this;if("[object Array]"!==Object.prototype.toString.call(e))return this.reject(new TypeError("must be an array"));var o=e.length,i=!1;if(!o)return this.resolve([]);for(var a=-1,s=new this(r);++a<o;)t(e[a]);return s}var p=e(7),v={},y=["REJECTED"],_=["FULFILLED"],m=["PENDING"];t.exports=o,o.prototype["catch"]=function(e){return this.then(null,e)},o.prototype.then=function(e,t){if("function"!=typeof e&&this.state===_||"function"!=typeof t&&this.state===y)return this;var n=new this.constructor(r);if(this.state!==m){var o=this.state===_?e:t;a(n,o,this.outcome)}else this.queue.push(new i(n,e,t));return n},i.prototype.callFulfilled=function(e){v.resolve(this.promise,e)},i.prototype.otherCallFulfilled=function(e){a(this.promise,this.onFulfilled,e)},i.prototype.callRejected=function(e){v.reject(this.promise,e)},i.prototype.otherCallRejected=function(e){a(this.promise,this.onRejected,e)},v.resolve=function(e,t){var n=c(s,t);if("error"===n.status)return v.reject(e,n.value);var r=n.value;if(r)u(e,r);else{e.state=_,e.outcome=t;for(var o=-1,i=e.queue.length;++o<i;)e.queue[o].callFulfilled(t)}return e},v.reject=function(e,t){e.state=y,e.outcome=t;for(var n=-1,r=e.queue.length;++n<r;)e.queue[n].callRejected(t);return e},o.resolve=f,o.reject=l,o.all=d,o.race=h},{7:7}],11:[function(e,t,n){function r(e){if(e=""+e,!(e.length>1e4)){var t=/^((?:\d+)?\.?\d+) *(milliseconds?|msecs?|ms|seconds?|secs?|s|minutes?|mins?|m|hours?|hrs?|h|days?|d|years?|yrs?|y)?$/i.exec(e);if(t){var n=parseFloat(t[1]),r=(t[2]||"ms").toLowerCase();switch(r){case"years":case"year":case"yrs":case"yr":case"y":return n*l;case"days":case"day":case"d":return n*f;case"hours":case"hour":case"hrs":case"hr":case"h":return n*c;case"minutes":case"minute":case"mins":case"min":case"m":return n*u;case"seconds":case"second":case"secs":case"sec":case"s":return n*s;case"milliseconds":case"millisecond":case"msecs":case"msec":case"ms":return n}}}}function o(e){return e>=f?Math.round(e/f)+"d":e>=c?Math.round(e/c)+"h":e>=u?Math.round(e/u)+"m":e>=s?Math.round(e/s)+"s":e+"ms"}function i(e){return a(e,f,"day")||a(e,c,"hour")||a(e,u,"minute")||a(e,s,"second")||e+" ms"}function a(e,t,n){return t>e?void 0:1.5*t>e?Math.floor(e/t)+" "+n:Math.ceil(e/t)+" "+n+"s"}var s=1e3,u=60*s,c=60*u,f=24*c,l=365.25*f;t.exports=function(e,t){return t=t||{},"string"==typeof e?r(e):t["long"]?i(e):o(e)}},{}],12:[function(e,t,n){"use strict";function r(e){if(null!==e)switch(typeof e){case"boolean":return e?1:0;case"number":return f(e);case"string":return e.replace(/\u0002/g,"").replace(/\u0001/g,"").replace(/\u0000/g,"");case"object":var t=Array.isArray(e),r=t?e:Object.keys(e),o=-1,i=r.length,a="";if(t)for(;++o<i;)a+=n.toIndexableString(r[o]);else for(;++o<i;){var s=r[o];a+=n.toIndexableString(s)+n.toIndexableString(e[s])}return a}return""}function o(e,t){var n,r=t,o="1"===e[t];if(o)n=0,t++;else{var i="0"===e[t];t++;var a="",s=e.substring(t,t+d),u=parseInt(s,10)+l;for(i&&(u=-u),t+=d;;){var c=e[t];if("\x00"===c)break;a+=c,t++}a=a.split("."),n=1===a.length?parseInt(a,10):parseFloat(a[0]+"."+a[1]),i&&(n-=10),0!==u&&(n=parseFloat(n+"e"+u))}return{num:n,length:t-r}}function i(e,t){var n=e.pop();if(t.length){var r=t[t.length-1];n===r.element&&(t.pop(),r=t[t.length-1]);var o=r.element,i=r.index;if(Array.isArray(o))o.push(n);else if(i===e.length-2){var a=e.pop();o[a]=n}else e.push(n)}}function a(e,t){for(var r=Math.min(e.length,t.length),o=0;r>o;o++){var i=n.collate(e[o],t[o]);if(0!==i)return i}return e.length===t.length?0:e.length>t.length?1:-1}function s(e,t){return e===t?0:e>t?1:-1}function u(e,t){for(var r=Object.keys(e),o=Object.keys(t),i=Math.min(r.length,o.length),a=0;i>a;a++){var s=n.collate(r[a],o[a]);if(0!==s)return s;if(s=n.collate(e[r[a]],t[o[a]]),0!==s)return s}return r.length===o.length?0:r.length>o.length?1:-1}function c(e){var t=["boolean","number","string","object"],n=t.indexOf(typeof e);return~n?null===e?1:Array.isArray(e)?5:3>n?n+2:n+3:Array.isArray(e)?5:void 0}function f(e){if(0===e)return"1";var t=e.toExponential().split(/e\+?/),n=parseInt(t[1],10),r=0>e,o=r?"0":"2",i=(r?-n:n)-l,a=p.padLeft(i.toString(),"0",d);
o+=h+a;var s=Math.abs(parseFloat(t[0]));r&&(s=10-s);var u=s.toFixed(20);return u=u.replace(/\.?0+$/,""),o+=h+u}var l=-324,d=3,h="",p=e(13);n.collate=function(e,t){if(e===t)return 0;e=n.normalizeKey(e),t=n.normalizeKey(t);var r=c(e),o=c(t);if(r-o!==0)return r-o;if(null===e)return 0;switch(typeof e){case"number":return e-t;case"boolean":return e===t?0:t>e?-1:1;case"string":return s(e,t)}return Array.isArray(e)?a(e,t):u(e,t)},n.normalizeKey=function(e){switch(typeof e){case"undefined":return null;case"number":return e===1/0||e===-(1/0)||isNaN(e)?null:e;case"object":var t=e;if(Array.isArray(e)){var r=e.length;e=new Array(r);for(var o=0;r>o;o++)e[o]=n.normalizeKey(t[o])}else{if(e instanceof Date)return e.toJSON();if(null!==e){e={};for(var i in t)if(t.hasOwnProperty(i)){var a=t[i];"undefined"!=typeof a&&(e[i]=n.normalizeKey(a))}}}}return e},n.toIndexableString=function(e){var t="\x00";return e=n.normalizeKey(e),c(e)+h+r(e)+t},n.parseIndexableString=function(e){for(var t=[],n=[],r=0;;){var a=e[r++];if("\x00"!==a)switch(a){case"1":t.push(null);break;case"2":t.push("1"===e[r]),r++;break;case"3":var s=o(e,r);t.push(s.num),r+=s.length;break;case"4":for(var u="";;){var c=e[r];if("\x00"===c)break;u+=c,r++}u=u.replace(/\u0001\u0001/g,"\x00").replace(/\u0001\u0002/g,"").replace(/\u0002\u0002/g,""),t.push(u);break;case"5":var f={element:[],index:t.length};t.push(f.element),n.push(f);break;case"6":var l={element:{},index:t.length};t.push(l.element),n.push(l);break;default:throw new Error("bad collationIndex or unexpectedly reached end of input: "+a)}else{if(1===t.length)return t.pop();i(t,n)}}}},{13:13}],13:[function(e,t,n){"use strict";function r(e,t,n){for(var r="",o=n-e.length;r.length<o;)r+=t;return r}n.padLeft=function(e,t,n){var o=r(e,t,n);return o+e},n.padRight=function(e,t,n){var o=r(e,t,n);return e+o},n.stringLexCompare=function(e,t){var n,r=e.length,o=t.length;for(n=0;r>n;n++){if(n===o)return 1;var i=e.charAt(n),a=t.charAt(n);if(i!==a)return a>i?-1:1}return o>r?-1:0},n.intToDecimalForm=function(e){var t=0>e,n="";do{var r=t?-Math.ceil(e%10):Math.floor(e%10);n=r+n,e=t?Math.ceil(e/10):Math.floor(e/10)}while(e);return t&&"0"!==n&&(n="-"+n),n}},{}],14:[function(e,t,n){"use strict";function r(){this.store={}}function o(e){if(this.store=new r,e&&Array.isArray(e))for(var t=0,n=e.length;n>t;t++)this.add(e[t])}n.Map=r,n.Set=o,r.prototype.mangle=function(e){if("string"!=typeof e)throw new TypeError("key must be a string but Got "+e);return"$"+e},r.prototype.unmangle=function(e){return e.substring(1)},r.prototype.get=function(e){var t=this.mangle(e);return t in this.store?this.store[t]:void 0},r.prototype.set=function(e,t){var n=this.mangle(e);return this.store[n]=t,!0},r.prototype.has=function(e){var t=this.mangle(e);return t in this.store},r.prototype["delete"]=function(e){var t=this.mangle(e);return t in this.store?(delete this.store[t],!0):!1},r.prototype.forEach=function(e){for(var t=Object.keys(this.store),n=0,r=t.length;r>n;n++){var o=t[n],i=this.store[o];o=this.unmangle(o),e(i,o)}},o.prototype.add=function(e){return this.store.set(e,!0)},o.prototype.has=function(e){return this.store.has(e)},o.prototype["delete"]=function(e){return this.store["delete"](e)}},{}],15:[function(e,t,n){(function(){var e={}.hasOwnProperty,n=[].slice;t.exports=function(t,r){var o,i,a,s;i=[],s=[];for(o in r)e.call(r,o)&&(a=r[o],"this"!==o&&(i.push(o),s.push(a)));return Function.apply(null,n.call(i).concat([t])).apply(r["this"],s)}}).call(this)},{}],16:[function(t,n,r){!function(t){if("object"==typeof r)n.exports=t();else if("function"==typeof e&&e.amd)e(t);else{var o;try{o=window}catch(i){o=self}o.SparkMD5=t()}}(function(e){"use strict";function t(e,t,n,r,o,i){return t=g(g(t,e),g(r,i)),g(t<<o|t>>>32-o,n)}function n(e,n,r,o,i,a,s){return t(n&r|~n&o,e,n,i,a,s)}function r(e,n,r,o,i,a,s){return t(n&o|r&~o,e,n,i,a,s)}function o(e,n,r,o,i,a,s){return t(n^r^o,e,n,i,a,s)}function i(e,n,r,o,i,a,s){return t(r^(n|~o),e,n,i,a,s)}function a(e,t){var a=e[0],s=e[1],u=e[2],c=e[3];a=n(a,s,u,c,t[0],7,-680876936),c=n(c,a,s,u,t[1],12,-389564586),u=n(u,c,a,s,t[2],17,606105819),s=n(s,u,c,a,t[3],22,-1044525330),a=n(a,s,u,c,t[4],7,-176418897),c=n(c,a,s,u,t[5],12,1200080426),u=n(u,c,a,s,t[6],17,-1473231341),s=n(s,u,c,a,t[7],22,-45705983),a=n(a,s,u,c,t[8],7,1770035416),c=n(c,a,s,u,t[9],12,-1958414417),u=n(u,c,a,s,t[10],17,-42063),s=n(s,u,c,a,t[11],22,-1990404162),a=n(a,s,u,c,t[12],7,1804603682),c=n(c,a,s,u,t[13],12,-40341101),u=n(u,c,a,s,t[14],17,-1502002290),s=n(s,u,c,a,t[15],22,1236535329),a=r(a,s,u,c,t[1],5,-165796510),c=r(c,a,s,u,t[6],9,-1069501632),u=r(u,c,a,s,t[11],14,643717713),s=r(s,u,c,a,t[0],20,-373897302),a=r(a,s,u,c,t[5],5,-701558691),c=r(c,a,s,u,t[10],9,38016083),u=r(u,c,a,s,t[15],14,-660478335),s=r(s,u,c,a,t[4],20,-405537848),a=r(a,s,u,c,t[9],5,568446438),c=r(c,a,s,u,t[14],9,-1019803690),u=r(u,c,a,s,t[3],14,-187363961),s=r(s,u,c,a,t[8],20,1163531501),a=r(a,s,u,c,t[13],5,-1444681467),c=r(c,a,s,u,t[2],9,-51403784),u=r(u,c,a,s,t[7],14,1735328473),s=r(s,u,c,a,t[12],20,-1926607734),a=o(a,s,u,c,t[5],4,-378558),c=o(c,a,s,u,t[8],11,-2022574463),u=o(u,c,a,s,t[11],16,1839030562),s=o(s,u,c,a,t[14],23,-35309556),a=o(a,s,u,c,t[1],4,-1530992060),c=o(c,a,s,u,t[4],11,1272893353),u=o(u,c,a,s,t[7],16,-155497632),s=o(s,u,c,a,t[10],23,-1094730640),a=o(a,s,u,c,t[13],4,681279174),c=o(c,a,s,u,t[0],11,-358537222),u=o(u,c,a,s,t[3],16,-722521979),s=o(s,u,c,a,t[6],23,76029189),a=o(a,s,u,c,t[9],4,-640364487),c=o(c,a,s,u,t[12],11,-421815835),u=o(u,c,a,s,t[15],16,530742520),s=o(s,u,c,a,t[2],23,-995338651),a=i(a,s,u,c,t[0],6,-198630844),c=i(c,a,s,u,t[7],10,1126891415),u=i(u,c,a,s,t[14],15,-1416354905),s=i(s,u,c,a,t[5],21,-57434055),a=i(a,s,u,c,t[12],6,1700485571),c=i(c,a,s,u,t[3],10,-1894986606),u=i(u,c,a,s,t[10],15,-1051523),s=i(s,u,c,a,t[1],21,-2054922799),a=i(a,s,u,c,t[8],6,1873313359),c=i(c,a,s,u,t[15],10,-30611744),u=i(u,c,a,s,t[6],15,-1560198380),s=i(s,u,c,a,t[13],21,1309151649),a=i(a,s,u,c,t[4],6,-145523070),c=i(c,a,s,u,t[11],10,-1120210379),u=i(u,c,a,s,t[2],15,718787259),s=i(s,u,c,a,t[9],21,-343485551),e[0]=g(a,e[0]),e[1]=g(s,e[1]),e[2]=g(u,e[2]),e[3]=g(c,e[3])}function s(e){var t,n=[];for(t=0;64>t;t+=4)n[t>>2]=e.charCodeAt(t)+(e.charCodeAt(t+1)<<8)+(e.charCodeAt(t+2)<<16)+(e.charCodeAt(t+3)<<24);return n}function u(e){var t,n=[];for(t=0;64>t;t+=4)n[t>>2]=e[t]+(e[t+1]<<8)+(e[t+2]<<16)+(e[t+3]<<24);return n}function c(e){var t,n,r,o,i,u,c=e.length,f=[1732584193,-271733879,-1732584194,271733878];for(t=64;c>=t;t+=64)a(f,s(e.substring(t-64,t)));for(e=e.substring(t-64),n=e.length,r=[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],t=0;n>t;t+=1)r[t>>2]|=e.charCodeAt(t)<<(t%4<<3);if(r[t>>2]|=128<<(t%4<<3),t>55)for(a(f,r),t=0;16>t;t+=1)r[t]=0;return o=8*c,o=o.toString(16).match(/(.*?)(.{0,8})$/),i=parseInt(o[2],16),u=parseInt(o[1],16)||0,r[14]=i,r[15]=u,a(f,r),f}function f(e){var t,n,r,o,i,s,c=e.length,f=[1732584193,-271733879,-1732584194,271733878];for(t=64;c>=t;t+=64)a(f,u(e.subarray(t-64,t)));for(e=c>t-64?e.subarray(t-64):new Uint8Array(0),n=e.length,r=[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],t=0;n>t;t+=1)r[t>>2]|=e[t]<<(t%4<<3);if(r[t>>2]|=128<<(t%4<<3),t>55)for(a(f,r),t=0;16>t;t+=1)r[t]=0;return o=8*c,o=o.toString(16).match(/(.*?)(.{0,8})$/),i=parseInt(o[2],16),s=parseInt(o[1],16)||0,r[14]=i,r[15]=s,a(f,r),f}function l(e){var t,n="";for(t=0;4>t;t+=1)n+=b[e>>8*t+4&15]+b[e>>8*t&15];return n}function d(e){var t;for(t=0;t<e.length;t+=1)e[t]=l(e[t]);return e.join("")}function h(e){return/[\u0080-\uFFFF]/.test(e)&&(e=unescape(encodeURIComponent(e))),e}function p(e,t){var n,r=e.length,o=new ArrayBuffer(r),i=new Uint8Array(o);for(n=0;r>n;n+=1)i[n]=e.charCodeAt(n);return t?i:o}function v(e){return String.fromCharCode.apply(null,new Uint8Array(e))}function y(e,t,n){var r=new Uint8Array(e.byteLength+t.byteLength);return r.set(new Uint8Array(e)),r.set(new Uint8Array(t),e.byteLength),n?r:r.buffer}function _(e){var t,n=[],r=e.length;for(t=0;r-1>t;t+=2)n.push(parseInt(e.substr(t,2),16));return String.fromCharCode.apply(String,n)}function m(){this.reset()}var g=function(e,t){return e+t&4294967295},b=["0","1","2","3","4","5","6","7","8","9","a","b","c","d","e","f"];return"5d41402abc4b2a76b9719d911017c592"!==d(c("hello"))&&(g=function(e,t){var n=(65535&e)+(65535&t),r=(e>>16)+(t>>16)+(n>>16);return r<<16|65535&n}),"undefined"==typeof ArrayBuffer||ArrayBuffer.prototype.slice||!function(){function t(e,t){return e=0|e||0,0>e?Math.max(e+t,0):Math.min(e,t)}ArrayBuffer.prototype.slice=function(n,r){var o,i,a,s,u=this.byteLength,c=t(n,u),f=u;return r!==e&&(f=t(r,u)),c>f?new ArrayBuffer(0):(o=f-c,i=new ArrayBuffer(o),a=new Uint8Array(i),s=new Uint8Array(this,c,o),a.set(s),i)}}(),m.prototype.append=function(e){return this.appendBinary(h(e)),this},m.prototype.appendBinary=function(e){this._buff+=e,this._length+=e.length;var t,n=this._buff.length;for(t=64;n>=t;t+=64)a(this._hash,s(this._buff.substring(t-64,t)));return this._buff=this._buff.substring(t-64),this},m.prototype.end=function(e){var t,n,r=this._buff,o=r.length,i=[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0];for(t=0;o>t;t+=1)i[t>>2]|=r.charCodeAt(t)<<(t%4<<3);return this._finish(i,o),n=d(this._hash),e&&(n=_(n)),this.reset(),n},m.prototype.reset=function(){return this._buff="",this._length=0,this._hash=[1732584193,-271733879,-1732584194,271733878],this},m.prototype.getState=function(){return{buff:this._buff,length:this._length,hash:this._hash}},m.prototype.setState=function(e){return this._buff=e.buff,this._length=e.length,this._hash=e.hash,this},m.prototype.destroy=function(){delete this._hash,delete this._buff,delete this._length},m.prototype._finish=function(e,t){var n,r,o,i=t;if(e[i>>2]|=128<<(i%4<<3),i>55)for(a(this._hash,e),i=0;16>i;i+=1)e[i]=0;n=8*this._length,n=n.toString(16).match(/(.*?)(.{0,8})$/),r=parseInt(n[2],16),o=parseInt(n[1],16)||0,e[14]=r,e[15]=o,a(this._hash,e)},m.hash=function(e,t){return m.hashBinary(h(e),t)},m.hashBinary=function(e,t){var n=c(e),r=d(n);return t?_(r):r},m.ArrayBuffer=function(){this.reset()},m.ArrayBuffer.prototype.append=function(e){var t,n=y(this._buff.buffer,e,!0),r=n.length;for(this._length+=e.byteLength,t=64;r>=t;t+=64)a(this._hash,u(n.subarray(t-64,t)));return this._buff=r>t-64?new Uint8Array(n.buffer.slice(t-64)):new Uint8Array(0),this},m.ArrayBuffer.prototype.end=function(e){var t,n,r=this._buff,o=r.length,i=[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0];for(t=0;o>t;t+=1)i[t>>2]|=r[t]<<(t%4<<3);return this._finish(i,o),n=d(this._hash),e&&(n=_(n)),this.reset(),n},m.ArrayBuffer.prototype.reset=function(){return this._buff=new Uint8Array(0),this._length=0,this._hash=[1732584193,-271733879,-1732584194,271733878],this},m.ArrayBuffer.prototype.getState=function(){var e=m.prototype.getState.call(this);return e.buff=v(e.buff),e},m.ArrayBuffer.prototype.setState=function(e){return e.buff=p(e.buff,!0),m.prototype.setState.call(this,e)},m.ArrayBuffer.prototype.destroy=m.prototype.destroy,m.ArrayBuffer.prototype._finish=m.prototype._finish,m.ArrayBuffer.hash=function(e,t){var n=f(new Uint8Array(e)),r=d(n);return t?_(r):r},m})},{}],17:[function(e,t,n){"use strict";function r(e,t,n){var r=n[n.length-1];e===r.element&&(n.pop(),r=n[n.length-1]);var o=r.element,i=r.index;if(Array.isArray(o))o.push(e);else if(i===t.length-2){var a=t.pop();o[a]=e}else t.push(e)}n.stringify=function(e){var t=[];t.push({obj:e});for(var n,r,o,i,a,s,u,c,f,l,d,h="";n=t.pop();)if(r=n.obj,o=n.prefix||"",i=n.val||"",h+=o,i)h+=i;else if("object"!=typeof r)h+="undefined"==typeof r?null:JSON.stringify(r);else if(null===r)h+="null";else if(Array.isArray(r)){for(t.push({val:"]"}),a=r.length-1;a>=0;a--)s=0===a?"":",",t.push({obj:r[a],prefix:s});t.push({val:"["})}else{u=[];for(c in r)r.hasOwnProperty(c)&&u.push(c);for(t.push({val:"}"}),a=u.length-1;a>=0;a--)f=u[a],l=r[f],d=a>0?",":"",d+=JSON.stringify(f)+":",t.push({obj:l,prefix:d});t.push({val:"{"})}return h},n.parse=function(e){for(var t,n,o,i,a,s,u,c,f,l=[],d=[],h=0;;)if(t=e[h++],"}"!==t&&"]"!==t&&"undefined"!=typeof t)switch(t){case" ":case"	":case"\n":case":":case",":break;case"n":h+=3,r(null,l,d);break;case"t":h+=3,r(!0,l,d);break;case"f":h+=4,r(!1,l,d);break;case"0":case"1":case"2":case"3":case"4":case"5":case"6":case"7":case"8":case"9":case"-":for(n="",h--;;){if(o=e[h++],!/[\d\.\-e\+]/.test(o)){h--;break}n+=o}r(parseFloat(n),l,d);break;case'"':for(i="",a=void 0,s=0;;){if(u=e[h++],'"'===u&&("\\"!==a||s%2!==1))break;i+=u,a=u,"\\"===a?s++:s=0}r(JSON.parse('"'+i+'"'),l,d);break;case"[":c={element:[],index:l.length},l.push(c.element),d.push(c);break;case"{":f={element:{},index:l.length},l.push(f.element),d.push(f);break;default:throw new Error("unexpectedly reached end of input: "+t)}else{if(1===l.length)return l.pop();r(l.pop(),l,d)}}},{}]},{},[3])(3)});


'use strict';

var _powet$elm_pouchdb$Native_ElmPouchdb = function() {
// var _user$project$Native_ElmPouchdb = function() {
  
  var nativeBinding = _elm_lang$core$Native_Scheduler.nativeBinding;
  var succeed = _elm_lang$core$Native_Scheduler.succeed;
  var fail = _elm_lang$core$Native_Scheduler.fail;
  var Nothing = _elm_lang$core$Maybe$Nothing;
  var Just = _elm_lang$core$Maybe$Just;
  var EmptyList = _elm_lang$core$Native_List.Nil;
  var Cons = _elm_lang$core$Native_List.Cons; 
  var rawSpawn = _elm_lang$core$Native_Scheduler.rawSpawn;
  var toArray = _elm_lang$core$Native_List.toArray;
  
  function ctorBool(val){
    return val?{ ctor: 'True' }:{ ctor: 'False' };
  }

  function ctorFailed(){
    ctor: 'Failed';
  }
  
  function toFail(error){
    return {
      status: error.status,
      name: error.name,
      message: error.message,
      reason: error.reason
    };
  }
  
  function toSuccessPut(response){
    return { id: response.id
             , rev: response.rev
           };
  }
 
  function setAjax(src,target){
    if( src.ctor ==='Just'){
      target.ajax={};
      if (src._0.cache.ctor==='Just'){
        target.ajax.cache=src._0.cache._0;
      }
      if (src._0.headers.ctor==='Just'){
        target.ajax.headers=src._0.headers._0;
      }
      if (src._0.withCredentials.ctor==='Just'){
        target.ajax.withCredentials=src._0.withCredentials._0;
      }
    }
  }

  function setAdapter(src,target){
    if( src.ctor ==='Idb'){
      target.adapter= 'idb';
    }
    if( src.ctor ==='LevelDb'){
      target.adapter= 'leveldb';
    }
    if( src.ctor ==='WebSql'){
      target.adapter= 'websql';
    }
    if( src.ctor ==='Http'){
      target.adapter= 'http';
    }
  }
  
  function setMaybe(src, target, attr){
    if (src.ctor ==='Just') {
      target[attr]=src._0;
    } else {
      target[attr]=undefined;
    }
  }
  
  function setMaybeComposed(src, target, composition, attr){
    if (src.ctor ==='Just') {
      if (target[composition] === undefined){
        target[composition] = {};
      }
      target[composition][attr]=src._0;
    }
  }

  function toDbOptions(opt){
    var options = {};
    setMaybe (opt.auto_compaction,options, 'auto_compaction');
    setAdapter(opt,opt.adaptor);
    setMaybe(opt.revs_limit,options,'revs_limit');
    setMaybeComposed(opt.username,options,'auth','username');
    setMaybeComposed(opt.password,options,'auth','password');
    setMaybeComposed(opt.cache,options,'ajax','cache');
    setMaybeComposed(opt.headers,options,'ajax','headers');
    setMaybeComposed(opt.withCredentials,options,'ajax','withCredentials');
    setMaybe(opt.skip_setup,options, 'skip_setup');
    return options;
  }
  
  function db(name,opt){
    var options = toDbOptions(opt);
    var rv = new PouchDB(name,options);
    return rv;
  };

  function toRevsGet(revisons){
    var revs = EmptyList;
    for (var property in revisons.ids) {
      var rev = {};
      rev.sequence= revisons.start-property;
      rev.uuid = revisons.ids[property];
      revs = Cons(rev, revs);
    }
    return revs;
  }

  function toSuccessGet(response) {
    var returnVal = {};
    returnVal.id=response._id;
    returnVal.rev=Just(response._rev);
    var doc = {};
    returnVal.conflicts = Nothing;
    returnVal.revisions = Nothing;
    for (var property in response) {
      if (property === "_conflicts") {
        returnVal.conflicts = Just(response[property]);
      } else if (property === "_revisions") {
        returnVal.revisions = Just(toRevsGet(response[property]));
      } else
        doc[property] = response[property];
    }
    returnVal.doc = Just(doc);
    returnVal.sequence = Nothing;
    return returnVal;  
  }

  function toSuccessAllDocs(response) {
    var returnVal = {};
    returnVal.offset=response.offset;
    returnVal.totalRows=response.total_rows;
    returnVal.docs=EmptyList;
    for (var docRef in response.rows){
      var respDoc=response.rows[docRef];
      if (respDoc.error===undefined){
        var doc = { id : respDoc.id
                    , rev : Just(respDoc.value.rev)
                    , doc : (respDoc.doc)?Just(respDoc.doc):Nothing
                    , revisions : Nothing
                    , conflicts : Nothing
                    , sequence : Nothing
                    , key : Nothing
                  };
        returnVal.docs = Cons(doc,returnVal.docs);
      }
    }
    return returnVal;  
  }

  function toSuccessQuery(response) {
    var returnVal = {};
    returnVal.offset=response.offset;
    returnVal.totalRows=response.total_rows;
    returnVal.docs=EmptyList;
    for (var docRef in response.rows){
      var respDoc=response.rows[docRef];
      var doc = { id : respDoc.id
                  , rev : respDoc.doc?Just(respDoc.doc._rev):Nothing
                  , doc : (respDoc.doc)?Just(respDoc.doc):Nothing
                  , revisions : Nothing
                  , conflicts : Nothing
                  , sequence : Nothing
                  , key: (respDoc.key)?Just(respDoc.key):Nothing
                };
      returnVal.docs = Cons(doc,returnVal.docs);
    }
    return returnVal;
  }

  function destroy(db){
    return nativeBinding(function(callback){
      db.destroy(function(err, response) {
        if (err) { return callback(fail({ ctor: 'Failed' })); }
        return callback(succeed({ ctor: 'Success' }));
      });
    });
  };

  function destructiveReset(db,name){
    var check = function (name,callback){
      var db=new PouchDB(name);
      db.allDocs(function(err, info) {
        if (err) { return callback(fail({ ctor: 'Failed' })); }
        return callback(succeed(db));
      });
    };
    return nativeBinding(function(callback){
      db.destroy(function(err, response) {
        if (err) { return callback(fail({ ctor: 'Failed' })); }
        return check(name,name,callback);
      });
    });
    };
  

  function put(db,doc,rev){
    return nativeBinding(function(callback){
      if (rev.ctor === 'Just') {
        doc._rev = rev._0;
      }
      db.put( doc, function(err,response) {
        if (err) { return callback(fail(toFail(err))); }
        return callback(succeed(toSuccessPut(response)));
      });
    });
  };
    
  function post(db,doc){
    return nativeBinding(function(callback){
      db.post( doc, function(err,response) {
        if (err) { return callback(fail(toFail(err))); }
        return callback(succeed(toSuccessPut(response)));
      });
    });
  }

  function remove(db,doc,rev){
    var devaredDoc = db;
    devaredDoc._devared=true;
    put(db,devaredDoc,rev);
  };

  function removeById(db,id,rev){
    var devaredDoc = { _id:id
                       , _devared:true};
    
    put(db,devaredDoc,rev);
  };

  function toGetOptions(req){
    var options= { };
    setMaybe(req.rev,options,'rev');
    setMaybe(req.revs,options,'revs');
    setMaybe(req.conflicts,options,'conflicts');
    setMaybe(req.attachments,options,'attachments');
    setMaybe(req.binary,options,'binary');
    return options;
  }
  
  function get(db,req) {
    var id = req.id;
    var options = toGetOptions(req);
    return nativeBinding(function(callback){
      db.get(id, options,function(err, doc) {
        if (err) { return callback(fail(toFail(err))); }
        return callback(succeed(toSuccessGet(doc)));
      });
    });
  }
  function replaceAny(item){
    if (item==="{}"){
      return {};
    }
    else {
      return item;
    }
  }
  
  function toAllDocsOptions(req){
    var options = {};
    setMaybe(req.include_docs,options,'include_docs');
    setMaybe(req.conflicts,options,'conflicts');
    setMaybe(req.attachments,options,'attachments');
    setMaybe(req.descending,options,'descending');
    setMaybe(req.skip,options,'skip');
    setMaybe(req.startkey,options,'startkey');
    if (options.startkey) {
      options.startkey = toArray(options.startkey);
      options.startkey = options.startkey.map(replaceAny);
      if(options.startkey.length==1){
        options.startkey =options.startkey[0];
      }
    }
    setMaybe(req.endkey,options,'endkey');
    if (options.endkey) {
      options.endkey = toArray(options.endkey);
      options.endkey = options.endkey.map(replaceAny);
      if(options.endkey.length==1){
        options.endkey =options.endkey[0];
      }
    }
    
    if (options.startkey && options.endkey){
      if(Array.isArray(options.startkey) && !Array.isArray(options.endkey)){
        options.endkey=[options.endkey];
      }
      if(Array.isArray(options.endkey) && !Array.isArray(options.startkey)){
        options.startkey=[options.startkey];
      } 
    }

    
    setMaybe(req.inclusive_end,options,'inclusive_end');
    setMaybe(req.limit,options,'limit');
    setMaybe(req.keys,options,'keys');
    if (options.keys) {
      options.keys = toArray(options.keys);
    }
    return options;
  }
  
  function allDocs(db,req) {
    var options = toAllDocsOptions(req);
    return nativeBinding(function(callback){
      db.allDocs(options,function(err, docs) {
        if (err) { return callback(fail(toFail(err))); }
        return callback(succeed(toSuccessAllDocs(docs)));
      });
    });
  }

  function setStale(stale,options){
    options.stale=undefined;
    if ( stale.ctor === 'Just') {
      switch (stale.ctor) {
      case 'Ok':
        options.stale= 'ok';
        break;
      case 'UpdateAfter':
        options.stale= 'update_after';
        break;
      }
    } 
    return options;
  }
  
  function setReduce(reduce,options){
    options.reduce=undefined;
    switch (reduce.ctor) {
    case 'Sum': 
      options.reduce='_sum';
      break;
    case 'Counts': 
      options.reduce='_counts';
      break;
    case 'Stats': 
      options.reduce='_stats';
      break;
    }
    return options;
  }

  function getFun(fun){
    var returnValue;
      switch (fun.ctor) {
      case 'MapReduce':
        returnValue = eval(fun._0);
        break;
      case 'Map':
        returnValue = Function ('doc',fun._0);
        break;
      case 'ViewName': 
        returnValue = fun._0;
        break;
      }
    return returnValue;
  };

  function setGroupLevel(group_level, options){
    options.group=undefined;
    setMaybe(group_level,options,'group_level');
    if (options.group_level){
      options.group=true;
    }
  }
  
  function query(db,opt) {
    var fun = getFun(opt.fun);
    var options = {};
    setMaybe(opt.include_docs,options,'include_docs');
    setMaybe(opt.conflicts,options,'conflicts');
    setMaybe(opt.attachments,options,'attachments');
    setMaybe(opt.descending,options,'descending');
    setMaybe(opt.skip,options,'skip');
    setMaybe(opt.startkey,options,'startkey');
    if (options.startkey) {
      options.startkey = toArray(options.startkey);
      options.startkey = options.startkey.map(replaceAny);
      if(options.startkey.length==1){
        options.startkey =options.startkey[0];
      }
    }
    setMaybe(opt.endkey,options,'endkey');
    if (options.endkey) {
      options.endkey = toArray(options.endkey);
      options.endkey = options.endkey.map(replaceAny);
      if(options.endkey.length==1){
        options.endkey =options.endkey[0];
      }
    }
    
    if (options.startkey && options.endkey){
      if(Array.isArray(options.startkey) && !Array.isArray(options.endkey)){
        options.endkey=[options.endkey];
      }
      if(Array.isArray(options.endkey) && !Array.isArray(options.startkey)){
        options.startkey=[options.startkey];
      } 
    }
     
    setMaybe(opt.inclusive_end,options,'inclusive_end');
    setMaybe(opt.limit,options,'limit');
    //setMaybe(opt.key,options,'key');
    setMaybe(opt.keys,options,'keys');
    if (options.keys) {
      options.keys = toArray(options.keys);
    }
    setStale(opt.stale,options);
    setReduce(opt.reduce,options);
    setGroupLevel(opt.groupLevel,options);
   
    return nativeBinding(function(callback){
      db.query(fun,options,function(err, docs) {
        if (err) { return callback(fail(toFail(err))); }
        return callback(succeed(toSuccessQuery(docs)));
      });
    });
  }
  
  return { db: F2(db)
           , destructiveReset:F2(destructiveReset)
           , destroy: destroy
           , get: F2(get)
           , allDocs: F2(allDocs)
           , query: F2(query)
           , put: F3(put)
           , post: F2(post)
           , remove:F3(remove)
           , removeById: F3(remove)
         };
}();

var _powet$elm_pouchdb$Pouchdb$query = F2(
	function (db, req) {
		return A2(_powet$elm_pouchdb$Native_ElmPouchdb.query, db, req);
	});
var _powet$elm_pouchdb$Pouchdb$allDocs = F2(
	function (db, req) {
		return A2(_powet$elm_pouchdb$Native_ElmPouchdb.allDocs, db, req);
	});
var _powet$elm_pouchdb$Pouchdb$fromValue = F2(
	function (decoder, doc) {
		var valDoc = function () {
			var _p0 = doc.doc;
			if (_p0.ctor === 'Just') {
				return A2(_elm_lang$core$Json_Decode$decodeValue, decoder, _p0._0);
			} else {
				return _elm_lang$core$Result$Err('trying to decode empty payload');
			}
		}();
		var _p1 = valDoc;
		if (_p1.ctor === 'Ok') {
			return _elm_lang$core$Result$Ok(
				{
					id: doc.id,
					rev: doc.rev,
					doc: _elm_lang$core$Maybe$Just(_p1._0),
					revisions: doc.revisions,
					conflicts: doc.conflicts,
					sequence: doc.sequence,
					key: doc.key
				});
		} else {
			return _elm_lang$core$Result$Err(
				{status: 0, name: 'empty payload', message: _p1._0});
		}
	});
var _powet$elm_pouchdb$Pouchdb$decode = F2(
	function (decoder, doc) {
		var _p2 = A2(_powet$elm_pouchdb$Pouchdb$fromValue, decoder, doc);
		if (_p2.ctor === 'Ok') {
			return _elm_lang$core$Task$succeed(_p2._0);
		} else {
			return _elm_lang$core$Task$fail(_p2._0);
		}
	});
var _powet$elm_pouchdb$Pouchdb$get = F3(
	function (db, decoder, req) {
		return A2(
			_elm_lang$core$Task$andThen,
			_powet$elm_pouchdb$Pouchdb$decode(decoder),
			A2(_powet$elm_pouchdb$Native_ElmPouchdb.get, db, req));
	});
var _powet$elm_pouchdb$Pouchdb$getValue = F2(
	function (db, req) {
		return A2(_powet$elm_pouchdb$Native_ElmPouchdb.get, db, req);
	});
var _powet$elm_pouchdb$Pouchdb$remove = F3(
	function (db, id, rev) {
		return A3(
			_powet$elm_pouchdb$Native_ElmPouchdb.removeById,
			db,
			id,
			_elm_lang$core$Maybe$Just(rev));
	});
var _powet$elm_pouchdb$Pouchdb$post = _powet$elm_pouchdb$Native_ElmPouchdb.post;
var _powet$elm_pouchdb$Pouchdb$put = _powet$elm_pouchdb$Native_ElmPouchdb.put;
var _powet$elm_pouchdb$Pouchdb$destroy = function (db) {
	return _powet$elm_pouchdb$Native_ElmPouchdb.destroy(db);
};
var _powet$elm_pouchdb$Pouchdb$destructiveReset = F2(
	function (db, name) {
		return A2(_powet$elm_pouchdb$Native_ElmPouchdb.destructiveReset, db, name);
	});
var _powet$elm_pouchdb$Pouchdb$db = F2(
	function (name, options) {
		return A2(_powet$elm_pouchdb$Native_ElmPouchdb.db, name, options);
	});
var _powet$elm_pouchdb$Pouchdb$adapter = F2(
	function (adapt, options) {
		return _elm_lang$core$Native_Utils.update(
			options,
			{adapter: adapt});
	});
var _powet$elm_pouchdb$Pouchdb$skipSetup = F2(
	function (skip, options) {
		return _elm_lang$core$Native_Utils.update(
			options,
			{
				skip_setup: _elm_lang$core$Maybe$Just(skip)
			});
	});
var _powet$elm_pouchdb$Pouchdb$revsLimit = F2(
	function (limit, options) {
		return _elm_lang$core$Native_Utils.update(
			options,
			{
				revs_limit: _elm_lang$core$Maybe$Just(limit)
			});
	});
var _powet$elm_pouchdb$Pouchdb$autoCompaction = F2(
	function (autoCompaction, options) {
		return _elm_lang$core$Native_Utils.update(
			options,
			{
				auto_compaction: _elm_lang$core$Maybe$Just(autoCompaction)
			});
	});
var _powet$elm_pouchdb$Pouchdb$ajaxWithCredentials = F2(
	function (withCredentials, options) {
		return _elm_lang$core$Native_Utils.update(
			options,
			{
				withCredentials: _elm_lang$core$Maybe$Just(withCredentials)
			});
	});
var _powet$elm_pouchdb$Pouchdb$ajaxHeaders = F2(
	function (headers, options) {
		return _elm_lang$core$Native_Utils.update(
			options,
			{
				headers: _elm_lang$core$Maybe$Just(headers)
			});
	});
var _powet$elm_pouchdb$Pouchdb$ajaxCache = F2(
	function (cache, options) {
		return _elm_lang$core$Native_Utils.update(
			options,
			{
				cache: _elm_lang$core$Maybe$Just(cache)
			});
	});
var _powet$elm_pouchdb$Pouchdb$auth = F3(
	function (username, password, options) {
		return _elm_lang$core$Native_Utils.update(
			options,
			{
				username: _elm_lang$core$Maybe$Just(username),
				password: _elm_lang$core$Maybe$Just(password)
			});
	});
var _powet$elm_pouchdb$Pouchdb$queryRequest = function (fun) {
	return {fun: fun, reduce: _elm_lang$core$Maybe$Nothing, include_docs: _elm_lang$core$Maybe$Nothing, conflicts: _elm_lang$core$Maybe$Nothing, attachments: _elm_lang$core$Maybe$Nothing, startkey: _elm_lang$core$Maybe$Nothing, endkey: _elm_lang$core$Maybe$Nothing, inclusive_end: _elm_lang$core$Maybe$Nothing, limit: _elm_lang$core$Maybe$Nothing, skip: _elm_lang$core$Maybe$Nothing, descending: _elm_lang$core$Maybe$Nothing, groupLevel: _elm_lang$core$Maybe$Nothing, keys: _elm_lang$core$Maybe$Nothing, stale: _elm_lang$core$Maybe$Nothing};
};
var _powet$elm_pouchdb$Pouchdb$keys = F2(
	function (x, request) {
		return _elm_lang$core$Native_Utils.update(
			request,
			{
				keys: _elm_lang$core$Maybe$Just(x),
				startkey: _elm_lang$core$Maybe$Nothing,
				endkey: _elm_lang$core$Maybe$Nothing
			});
	});
var _powet$elm_pouchdb$Pouchdb$descending = F2(
	function (x, request) {
		return _elm_lang$core$Native_Utils.update(
			request,
			{
				descending: _elm_lang$core$Maybe$Just(x)
			});
	});
var _powet$elm_pouchdb$Pouchdb$skip = F2(
	function (x, request) {
		return _elm_lang$core$Native_Utils.update(
			request,
			{
				skip: _elm_lang$core$Maybe$Just(x)
			});
	});
var _powet$elm_pouchdb$Pouchdb$limit = F2(
	function (x, request) {
		return _elm_lang$core$Native_Utils.update(
			request,
			{
				limit: _elm_lang$core$Maybe$Just(x)
			});
	});
var _powet$elm_pouchdb$Pouchdb$inclusive_end = F2(
	function (x, request) {
		return _elm_lang$core$Native_Utils.update(
			request,
			{
				inclusive_end: _elm_lang$core$Maybe$Just(x),
				keys: _elm_lang$core$Maybe$Nothing
			});
	});
var _powet$elm_pouchdb$Pouchdb$endkey = F2(
	function (x, request) {
		return _elm_lang$core$Native_Utils.update(
			request,
			{
				endkey: _elm_lang$core$Maybe$Just(x),
				keys: _elm_lang$core$Maybe$Nothing
			});
	});
var _powet$elm_pouchdb$Pouchdb$startkey = F2(
	function (x, request) {
		return _elm_lang$core$Native_Utils.update(
			request,
			{
				startkey: _elm_lang$core$Maybe$Just(x),
				keys: _elm_lang$core$Maybe$Nothing
			});
	});
var _powet$elm_pouchdb$Pouchdb$include_docs = F2(
	function (x, request) {
		return _elm_lang$core$Native_Utils.update(
			request,
			{
				include_docs: _elm_lang$core$Maybe$Just(x)
			});
	});
var _powet$elm_pouchdb$Pouchdb$allDocsRequest = {include_docs: _elm_lang$core$Maybe$Nothing, conflicts: _elm_lang$core$Maybe$Nothing, attachments: _elm_lang$core$Maybe$Nothing, startkey: _elm_lang$core$Maybe$Nothing, endkey: _elm_lang$core$Maybe$Nothing, inclusive_end: _elm_lang$core$Maybe$Nothing, limit: _elm_lang$core$Maybe$Nothing, skip: _elm_lang$core$Maybe$Nothing, descending: _elm_lang$core$Maybe$Nothing, keys: _elm_lang$core$Maybe$Nothing};
var _powet$elm_pouchdb$Pouchdb$binary = F2(
	function (x, request) {
		return _elm_lang$core$Native_Utils.update(
			request,
			{
				binary: _elm_lang$core$Maybe$Just(x)
			});
	});
var _powet$elm_pouchdb$Pouchdb$attachments = F2(
	function (x, request) {
		return _elm_lang$core$Native_Utils.update(
			request,
			{
				attachments: _elm_lang$core$Maybe$Just(x)
			});
	});
var _powet$elm_pouchdb$Pouchdb$conflicts = F2(
	function (x, request) {
		return _elm_lang$core$Native_Utils.update(
			request,
			{
				conflicts: _elm_lang$core$Maybe$Just(x)
			});
	});
var _powet$elm_pouchdb$Pouchdb$revs = F2(
	function (x, request) {
		return _elm_lang$core$Native_Utils.update(
			request,
			{
				revs: _elm_lang$core$Maybe$Just(x)
			});
	});
var _powet$elm_pouchdb$Pouchdb$request = F2(
	function (id, rev) {
		return {id: id, rev: rev, revs: _elm_lang$core$Maybe$Nothing, conflicts: _elm_lang$core$Maybe$Nothing, attachments: _elm_lang$core$Maybe$Nothing, binary: _elm_lang$core$Maybe$Nothing};
	});
var _powet$elm_pouchdb$Pouchdb$DocRequest = F6(
	function (a, b, c, d, e, f) {
		return {id: a, rev: b, revs: c, conflicts: d, attachments: e, binary: f};
	});
var _powet$elm_pouchdb$Pouchdb$AllDocsRequest = function (a) {
	return function (b) {
		return function (c) {
			return function (d) {
				return function (e) {
					return function (f) {
						return function (g) {
							return function (h) {
								return function (i) {
									return function (j) {
										return {include_docs: a, conflicts: b, attachments: c, startkey: d, endkey: e, inclusive_end: f, limit: g, skip: h, descending: i, keys: j};
									};
								};
							};
						};
					};
				};
			};
		};
	};
};
var _powet$elm_pouchdb$Pouchdb$QueryRequest = function (a) {
	return function (b) {
		return function (c) {
			return function (d) {
				return function (e) {
					return function (f) {
						return function (g) {
							return function (h) {
								return function (i) {
									return function (j) {
										return function (k) {
											return function (l) {
												return function (m) {
													return function (n) {
														return {fun: a, reduce: b, include_docs: c, conflicts: d, attachments: e, startkey: f, endkey: g, inclusive_end: h, limit: i, skip: j, descending: k, groupLevel: l, keys: m, stale: n};
													};
												};
											};
										};
									};
								};
							};
						};
					};
				};
			};
		};
	};
};
var _powet$elm_pouchdb$Pouchdb$Fail = F3(
	function (a, b, c) {
		return {status: a, name: b, message: c};
	});
var _powet$elm_pouchdb$Pouchdb$Put = F2(
	function (a, b) {
		return {id: a, rev: b};
	});
var _powet$elm_pouchdb$Pouchdb$Post = F2(
	function (a, b) {
		return {id: a, rev: b};
	});
var _powet$elm_pouchdb$Pouchdb$Remove = F2(
	function (a, b) {
		return {id: a, rev: b};
	});
var _powet$elm_pouchdb$Pouchdb$Revision = F2(
	function (a, b) {
		return {sequence: a, uuid: b};
	});
var _powet$elm_pouchdb$Pouchdb$Doc = F7(
	function (a, b, c, d, e, f, g) {
		return {id: a, rev: b, doc: c, revisions: d, conflicts: e, sequence: f, key: g};
	});
var _powet$elm_pouchdb$Pouchdb$AllDocs = F3(
	function (a, b, c) {
		return {offset: a, totalRows: b, docs: c};
	});
var _powet$elm_pouchdb$Pouchdb$Options = F9(
	function (a, b, c, d, e, f, g, h, i) {
		return {auto_compaction: a, adapter: b, revs_limit: c, username: d, password: e, cache: f, headers: g, withCredentials: h, skip_setup: i};
	});
var _powet$elm_pouchdb$Pouchdb$Pouchdb = {ctor: 'Pouchdb'};
var _powet$elm_pouchdb$Pouchdb$ViewName = function (a) {
	return {ctor: 'ViewName', _0: a};
};
var _powet$elm_pouchdb$Pouchdb$Map = function (a) {
	return {ctor: 'Map', _0: a};
};
var _powet$elm_pouchdb$Pouchdb$MapReduce = function (a) {
	return {ctor: 'MapReduce', _0: a};
};
var _powet$elm_pouchdb$Pouchdb$Fun = function (a) {
	return {ctor: 'Fun', _0: a};
};
var _powet$elm_pouchdb$Pouchdb$Stats = {ctor: 'Stats'};
var _powet$elm_pouchdb$Pouchdb$Count = {ctor: 'Count'};
var _powet$elm_pouchdb$Pouchdb$Sum = {ctor: 'Sum'};
var _powet$elm_pouchdb$Pouchdb$UpdateAfter = {ctor: 'UpdateAfter'};
var _powet$elm_pouchdb$Pouchdb$Ok = {ctor: 'Ok'};
var _powet$elm_pouchdb$Pouchdb$Success = {ctor: 'Success'};
var _powet$elm_pouchdb$Pouchdb$Failed = {ctor: 'Failed'};
var _powet$elm_pouchdb$Pouchdb$Auto = {ctor: 'Auto'};
var _powet$elm_pouchdb$Pouchdb$dbOptions = {auto_compaction: _elm_lang$core$Maybe$Nothing, adapter: _powet$elm_pouchdb$Pouchdb$Auto, revs_limit: _elm_lang$core$Maybe$Nothing, username: _elm_lang$core$Maybe$Nothing, password: _elm_lang$core$Maybe$Nothing, cache: _elm_lang$core$Maybe$Nothing, headers: _elm_lang$core$Maybe$Nothing, withCredentials: _elm_lang$core$Maybe$Nothing, skip_setup: _elm_lang$core$Maybe$Nothing};
var _powet$elm_pouchdb$Pouchdb$Http = {ctor: 'Http'};
var _powet$elm_pouchdb$Pouchdb$WebSql = {ctor: 'WebSql'};
var _powet$elm_pouchdb$Pouchdb$LevelDb = {ctor: 'LevelDb'};
var _powet$elm_pouchdb$Pouchdb$Idb = {ctor: 'Idb'};

var _fifth_postulate$trade_card$TradeCard_Client$subscriptions = function (_p0) {
	return _elm_lang$core$Platform_Sub$none;
};
var _fifth_postulate$trade_card$TradeCard_Client$unpack = F3(
	function (errFunc, okFunc, result) {
		var _p1 = result;
		if (_p1.ctor === 'Ok') {
			return okFunc(_p1._0);
		} else {
			return errFunc(_p1._0);
		}
	});
var _fifth_postulate$trade_card$TradeCard_Client$applyEvent = F2(
	function (event, collection) {
		var _p2 = event;
		switch (_p2.ctor) {
			case 'Collected':
				var _p3 = A2(_fifth_postulate$trade_card$TradeCard_Collection$collect, _p2._1, collection);
				if (_p3.ctor === 'Ok') {
					return _p3._0;
				} else {
					return collection;
				}
			case 'Traded':
				return A2(_fifth_postulate$trade_card$TradeCard_Collection$remove, _p2._1, collection);
			default:
				return A2(_fifth_postulate$trade_card$TradeCard_Collection$remove, _p2._1, collection);
		}
	});
var _fifth_postulate$trade_card$TradeCard_Client$dropWhile = F2(
	function (predicate, word) {
		dropWhile:
		while (true) {
			var _p4 = _elm_lang$core$String$uncons(word);
			if (_p4.ctor === 'Just') {
				if (predicate(_p4._0._0)) {
					var _v4 = predicate,
						_v5 = _p4._0._1;
					predicate = _v4;
					word = _v5;
					continue dropWhile;
				} else {
					return word;
				}
			} else {
				return word;
			}
		}
	});
var _fifth_postulate$trade_card$TradeCard_Client$stripZero = function (word) {
	return A2(
		_fifth_postulate$trade_card$TradeCard_Client$dropWhile,
		function (c) {
			return _elm_lang$core$Native_Utils.eq(
				c,
				_elm_lang$core$Native_Utils.chr('0'));
		},
		word);
};
var _fifth_postulate$trade_card$TradeCard_Client$pad = F2(
	function (symbol, n) {
		return (_elm_lang$core$Native_Utils.cmp(n, 0) < 1) ? '' : A2(
			_elm_lang$core$Basics_ops['++'],
			symbol,
			A2(
				_fifth_postulate$trade_card$TradeCard_Client$pad,
				symbol,
				n - _elm_lang$core$String$length(symbol)));
	});
var _fifth_postulate$trade_card$TradeCard_Client$zeroPad = F2(
	function (padLength, n) {
		var representation = _elm_lang$core$Basics$toString(n);
		var padding = A2(
			_fifth_postulate$trade_card$TradeCard_Client$pad,
			'0',
			padLength - _elm_lang$core$String$length(representation));
		return A2(_elm_lang$core$Basics_ops['++'], padding, representation);
	});
var _fifth_postulate$trade_card$TradeCard_Client$encodeEvent = function (eventType) {
	var _p5 = function () {
		var _p6 = eventType;
		switch (_p6.ctor) {
			case 'Collected':
				return {ctor: '_Tuple3', _0: _p6._0, _1: 'collected', _2: _p6._1.id};
			case 'Traded':
				return {ctor: '_Tuple3', _0: _p6._0, _1: 'traded', _2: _p6._1.id};
			default:
				return {ctor: '_Tuple3', _0: _p6._0, _1: 'lost', _2: _p6._1.id};
		}
	}();
	var eventId = _p5._0;
	var cardType = _p5._1;
	var cardId = _p5._2;
	return _elm_lang$core$Json_Encode$object(
		{
			ctor: '::',
			_0: {
				ctor: '_Tuple2',
				_0: '_id',
				_1: _elm_lang$core$Json_Encode$string(
					A2(_fifth_postulate$trade_card$TradeCard_Client$zeroPad, 15, eventId))
			},
			_1: {
				ctor: '::',
				_0: {
					ctor: '_Tuple2',
					_0: 'type',
					_1: _elm_lang$core$Json_Encode$string(cardType)
				},
				_1: {
					ctor: '::',
					_0: {
						ctor: '_Tuple2',
						_0: 'cardId',
						_1: _elm_lang$core$Json_Encode$int(cardId)
					},
					_1: {ctor: '[]'}
				}
			}
		});
};
var _fifth_postulate$trade_card$TradeCard_Client$emptyModel = F3(
	function (localDb, low, high) {
		return {
			message: _elm_lang$core$Maybe$Nothing,
			localDb: localDb,
			cardId: '',
			nextEventId: 1,
			collection: A2(_fifth_postulate$trade_card$TradeCard_Collection$empty, low, high)
		};
	});
var _fifth_postulate$trade_card$TradeCard_Client$Model = F5(
	function (a, b, c, d, e) {
		return {message: a, localDb: b, cardId: c, nextEventId: d, collection: e};
	});
var _fifth_postulate$trade_card$TradeCard_Client$History = function (a) {
	return {ctor: 'History', _0: a};
};
var _fifth_postulate$trade_card$TradeCard_Client$init = function () {
	var request = A2(_powet$elm_pouchdb$Pouchdb$include_docs, true, _powet$elm_pouchdb$Pouchdb$allDocsRequest);
	var localDb = A2(_powet$elm_pouchdb$Pouchdb$db, 'card-events', _powet$elm_pouchdb$Pouchdb$dbOptions);
	var task = A2(_powet$elm_pouchdb$Pouchdb$allDocs, localDb, request);
	var command = A2(_elm_lang$core$Task$attempt, _fifth_postulate$trade_card$TradeCard_Client$History, task);
	return {
		ctor: '_Tuple2',
		_0: A3(_fifth_postulate$trade_card$TradeCard_Client$emptyModel, localDb, 1, 15),
		_1: command
	};
}();
var _fifth_postulate$trade_card$TradeCard_Client$Post = function (a) {
	return {ctor: 'Post', _0: a};
};
var _fifth_postulate$trade_card$TradeCard_Client$Remove = function (a) {
	return {ctor: 'Remove', _0: a};
};
var _fifth_postulate$trade_card$TradeCard_Client$Trade = function (a) {
	return {ctor: 'Trade', _0: a};
};
var _fifth_postulate$trade_card$TradeCard_Client$Collect = function (a) {
	return {ctor: 'Collect', _0: a};
};
var _fifth_postulate$trade_card$TradeCard_Client$UpdateCardId = function (a) {
	return {ctor: 'UpdateCardId', _0: a};
};
var _fifth_postulate$trade_card$TradeCard_Client$view = function (model) {
	var lose = _elm_lang$core$Maybe$Just(
		function (c) {
			return _fifth_postulate$trade_card$TradeCard_Client$Remove(c);
		});
	var collect = function (c) {
		return _fifth_postulate$trade_card$TradeCard_Client$Collect(c);
	};
	var trade = function (c) {
		return _fifth_postulate$trade_card$TradeCard_Client$Trade(c);
	};
	var message = A2(_elm_lang$core$Maybe$withDefault, '', model.message);
	return A2(
		_elm_lang$html$Html$div,
		{ctor: '[]'},
		{
			ctor: '::',
			_0: A2(
				_elm_lang$html$Html$div,
				{ctor: '[]'},
				{
					ctor: '::',
					_0: A2(
						_elm_lang$html$Html$span,
						{ctor: '[]'},
						{
							ctor: '::',
							_0: _elm_lang$html$Html$text(message),
							_1: {ctor: '[]'}
						}),
					_1: {ctor: '[]'}
				}),
			_1: {
				ctor: '::',
				_0: A2(
					_elm_lang$html$Html$div,
					{
						ctor: '::',
						_0: _elm_lang$html$Html_Attributes$class('collector'),
						_1: {ctor: '[]'}
					},
					{
						ctor: '::',
						_0: A2(
							_elm_lang$html$Html$input,
							{
								ctor: '::',
								_0: _elm_lang$html$Html_Attributes$type_('input'),
								_1: {
									ctor: '::',
									_0: _elm_lang$html$Html_Attributes$value(model.cardId),
									_1: {
										ctor: '::',
										_0: _elm_lang$html$Html_Events$onInput(_fifth_postulate$trade_card$TradeCard_Client$UpdateCardId),
										_1: {ctor: '[]'}
									}
								}
							},
							{ctor: '[]'}),
						_1: {ctor: '[]'}
					}),
				_1: {
					ctor: '::',
					_0: A6(_fifth_postulate$trade_card$TradeCard_View$collectionView, model.cardId, collect, lose, trade, collect, model.collection),
					_1: {ctor: '[]'}
				}
			}
		});
};
var _fifth_postulate$trade_card$TradeCard_Client$DoNothing = {ctor: 'DoNothing'};
var _fifth_postulate$trade_card$TradeCard_Client$Lost = F2(
	function (a, b) {
		return {ctor: 'Lost', _0: a, _1: b};
	});
var _fifth_postulate$trade_card$TradeCard_Client$Traded = F2(
	function (a, b) {
		return {ctor: 'Traded', _0: a, _1: b};
	});
var _fifth_postulate$trade_card$TradeCard_Client$Collected = F2(
	function (a, b) {
		return {ctor: 'Collected', _0: a, _1: b};
	});
var _fifth_postulate$trade_card$TradeCard_Client$eventDecoder = function () {
	var cardEventMapper = F3(
		function (eventIdRepresentation, eventType, cardId) {
			var card = {id: cardId};
			var stripped = _fifth_postulate$trade_card$TradeCard_Client$stripZero(eventIdRepresentation);
			var eventId = function () {
				var _p7 = _elm_lang$core$String$toInt(stripped);
				if (_p7.ctor === 'Ok') {
					return _p7._0;
				} else {
					return 0;
				}
			}();
			var _p8 = eventType;
			switch (_p8) {
				case 'collected':
					return A2(_fifth_postulate$trade_card$TradeCard_Client$Collected, eventId, card);
				case 'traded':
					return A2(_fifth_postulate$trade_card$TradeCard_Client$Traded, eventId, card);
				case 'lost':
					return A2(_fifth_postulate$trade_card$TradeCard_Client$Lost, eventId, card);
				default:
					return A2(_fifth_postulate$trade_card$TradeCard_Client$Lost, 0, card);
			}
		});
	return A4(
		_elm_lang$core$Json_Decode$map3,
		cardEventMapper,
		A2(_elm_lang$core$Json_Decode$field, '_id', _elm_lang$core$Json_Decode$string),
		A2(_elm_lang$core$Json_Decode$field, 'type', _elm_lang$core$Json_Decode$string),
		A2(_elm_lang$core$Json_Decode$field, 'cardId', _elm_lang$core$Json_Decode$int));
}();
var _fifth_postulate$trade_card$TradeCard_Client$update = F2(
	function (message, model) {
		var _p9 = message;
		switch (_p9.ctor) {
			case 'DoNothing':
				return {ctor: '_Tuple2', _0: model, _1: _elm_lang$core$Platform_Cmd$none};
			case 'Post':
				var unpackedMessage = A3(
					_fifth_postulate$trade_card$TradeCard_Client$unpack,
					function (m) {
						return A2(_elm_lang$core$String$append, 'could not put message: ', m.message);
					},
					function (m) {
						return A2(_elm_lang$core$String$append, 'saved message with revision: ', m.rev);
					},
					_p9._0);
				return {
					ctor: '_Tuple2',
					_0: _elm_lang$core$Native_Utils.update(
						model,
						{
							message: _elm_lang$core$Maybe$Just(unpackedMessage)
						}),
					_1: _elm_lang$core$Platform_Cmd$none
				};
			case 'History':
				var onSuccess = F2(
					function (model, msg) {
						var maxId = F2(
							function (event, current) {
								var id = function () {
									var _p10 = event;
									switch (_p10.ctor) {
										case 'Collected':
											return _p10._0;
										case 'Traded':
											return _p10._0;
										default:
											return _p10._0;
									}
								}();
								return A2(_elm_lang$core$Basics$max, current, id);
							});
						var filterMapFun = function (aDoc) {
							var _p11 = aDoc.doc;
							if (_p11.ctor === 'Just') {
								return _elm_lang$core$Result$toMaybe(
									A2(_elm_lang$core$Json_Decode$decodeValue, _fifth_postulate$trade_card$TradeCard_Client$eventDecoder, _p11._0));
							} else {
								return _elm_lang$core$Maybe$Nothing;
							}
						};
						var events = A2(_elm_lang$core$List$filterMap, filterMapFun, msg.docs);
						var maxEventId = A3(_elm_lang$core$List$foldr, maxId, 0, events);
						var nextEventId = 1 + maxEventId;
						var updatedCollection = A3(_elm_lang$core$List$foldr, _fifth_postulate$trade_card$TradeCard_Client$applyEvent, model.collection, events);
						return {
							ctor: '_Tuple2',
							_0: _elm_lang$core$Native_Utils.update(
								model,
								{nextEventId: nextEventId, collection: updatedCollection}),
							_1: _elm_lang$core$Platform_Cmd$none
						};
					});
				var onError = F2(
					function (model, msg) {
						return {ctor: '_Tuple2', _0: model, _1: _elm_lang$core$Platform_Cmd$none};
					});
				return A3(
					_fifth_postulate$trade_card$TradeCard_Client$unpack,
					onError(model),
					onSuccess(model),
					_p9._0);
			case 'UpdateCardId':
				return {
					ctor: '_Tuple2',
					_0: _elm_lang$core$Native_Utils.update(
						model,
						{cardId: _p9._0}),
					_1: _elm_lang$core$Platform_Cmd$none
				};
			case 'Collect':
				var _p13 = _p9._0;
				var task = A2(
					_powet$elm_pouchdb$Pouchdb$post,
					model.localDb,
					_fifth_postulate$trade_card$TradeCard_Client$encodeEvent(
						A2(_fifth_postulate$trade_card$TradeCard_Client$Collected, model.nextEventId, _p13)));
				var command = A2(_elm_lang$core$Task$attempt, _fifth_postulate$trade_card$TradeCard_Client$Post, task);
				var _p12 = A2(_fifth_postulate$trade_card$TradeCard_Collection$collect, _p13, model.collection);
				if (_p12.ctor === 'Ok') {
					return {
						ctor: '_Tuple2',
						_0: _elm_lang$core$Native_Utils.update(
							model,
							{collection: _p12._0, nextEventId: model.nextEventId + 1, cardId: ''}),
						_1: command
					};
				} else {
					return {ctor: '_Tuple2', _0: model, _1: _elm_lang$core$Platform_Cmd$none};
				}
			case 'Trade':
				var _p14 = _p9._0;
				var nextCollection = A2(_fifth_postulate$trade_card$TradeCard_Collection$remove, _p14, model.collection);
				var task = A2(
					_powet$elm_pouchdb$Pouchdb$post,
					model.localDb,
					_fifth_postulate$trade_card$TradeCard_Client$encodeEvent(
						A2(_fifth_postulate$trade_card$TradeCard_Client$Traded, model.nextEventId, _p14)));
				var command = A2(_elm_lang$core$Task$attempt, _fifth_postulate$trade_card$TradeCard_Client$Post, task);
				return {
					ctor: '_Tuple2',
					_0: _elm_lang$core$Native_Utils.update(
						model,
						{collection: nextCollection, nextEventId: model.nextEventId + 1, cardId: ''}),
					_1: command
				};
			default:
				var _p15 = _p9._0;
				var nextCollection = A2(_fifth_postulate$trade_card$TradeCard_Collection$remove, _p15, model.collection);
				var task = A2(
					_powet$elm_pouchdb$Pouchdb$post,
					model.localDb,
					_fifth_postulate$trade_card$TradeCard_Client$encodeEvent(
						A2(_fifth_postulate$trade_card$TradeCard_Client$Lost, model.nextEventId, _p15)));
				var command = A2(_elm_lang$core$Task$attempt, _fifth_postulate$trade_card$TradeCard_Client$Post, task);
				return {
					ctor: '_Tuple2',
					_0: _elm_lang$core$Native_Utils.update(
						model,
						{collection: nextCollection, nextEventId: model.nextEventId + 1, cardId: ''}),
					_1: command
				};
		}
	});
var _fifth_postulate$trade_card$TradeCard_Client$main = _elm_lang$html$Html$program(
	{init: _fifth_postulate$trade_card$TradeCard_Client$init, update: _fifth_postulate$trade_card$TradeCard_Client$update, view: _fifth_postulate$trade_card$TradeCard_Client$view, subscriptions: _fifth_postulate$trade_card$TradeCard_Client$subscriptions})();

var Elm = {};
Elm['TradeCard'] = Elm['TradeCard'] || {};
Elm['TradeCard']['Client'] = Elm['TradeCard']['Client'] || {};
if (typeof _fifth_postulate$trade_card$TradeCard_Client$main !== 'undefined') {
    _fifth_postulate$trade_card$TradeCard_Client$main(Elm['TradeCard']['Client'], 'TradeCard.Client', undefined);
}

if (typeof define === "function" && define['amd'])
{
  define([], function() { return Elm; });
  return;
}

if (typeof module === "object")
{
  module['exports'] = Elm;
  return;
}

var globalElm = this['Elm'];
if (typeof globalElm === "undefined")
{
  this['Elm'] = Elm;
  return;
}

for (var publicModule in Elm)
{
  if (publicModule in globalElm)
  {
    throw new Error('There are two Elm modules called `' + publicModule + '` on this page! Rename one of them.');
  }
  globalElm[publicModule] = Elm[publicModule];
}

}).call(this);

