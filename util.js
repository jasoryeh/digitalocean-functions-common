const getCircularReplacer = () => {
    const seen = new WeakSet()
    return (key, value) => {
      if (typeof value === "object" && value !== null) {
        if (seen.has(value)) {
          return
        }
        seen.add(value)
      }
      return value
    }
}

function errToObj( err ) {
	var out;
	var i;
	out = {};

	// Guaranteed properties:
	out.type = typeof err;
	out.message = err.message;

	// Possible general error properties...
	if ( err.name ) {
		out.name = err.name;
	}
	if ( err.stack ) {
		out.stack = err.stack;
	}
	// Possible Node.js (system error) properties...
	if ( err.code ) {
		out.code = err.code;
	}
	if ( err.errno ) {
		out.errno = err.errno;
	}
	if ( err.syscall ) {
		out.syscall = err.syscall;
	}
	return out;
}

function requireNonNull(obj, msg = "An object that was used was asserted to be non-null.") {
    if (!obj || obj == null) {
        throw new Error("Object must not be null: " + msg);
    }
    return obj;
}

function firstOrNull(listOfItems) {
    return listOfItems.length > 0 ? listOfItems[0] : null;
}

function insertedRowID(res) {
  return res.insertId;
}

module.exports = {getCircularReplacer, requireNonNull, firstOrNull, insertedRowID, errToObj};