var systemLib = require('system');
var ioLib = require('io');
var entityLib = require('entity');

// create entity by parsing JSON object from request body
exports.createSubjects = function() {
    var input = ioLib.read(request.getReader());
    var message = JSON.parse(input);
    var connection = datasource.getConnection();
    try {
        var sql = "INSERT INTO SUBJECTS (";
        sql += "ID";
        sql += ",";
        sql += "NAME";
        sql += ",";
        sql += "LEVEL_ID";
        sql += ") VALUES ("; 
        sql += "?";
        sql += ",";
        sql += "?";
        sql += ",";
        sql += "?";
        sql += ")";

        var statement = connection.prepareStatement(sql);
        var i = 0;
        var id = db.getNext('SUBJECTS_ID');
        statement.setInt(++i, id);
        statement.setString(++i, message.name);
        statement.setInt(++i, message.level_id);
        statement.executeUpdate();
        response.getWriter().println(id);
        return id;
    } catch(e) {
        var errorCode = javax.servlet.http.HttpServletResponse.SC_BAD_REQUEST;
        entityLib.printError(errorCode, errorCode, e.message);
    } finally {
        connection.close();
    }
    return -1;
};

// read single entity by id and print as JSON object to response
exports.readSubjectsEntity = function(id) {
    var connection = datasource.getConnection();
    try {
        var result = "";
        var sql = "SELECT * FROM SUBJECTS WHERE " + pkToSQL();
        var statement = connection.prepareStatement(sql);
        statement.setString(1, id);
        
        var resultSet = statement.executeQuery();
        var value;
        while (resultSet.next()) {
            result = createEntity(resultSet);
        }
        if(result.length === 0){
            entityLib.printError(javax.servlet.http.HttpServletResponse.SC_NOT_FOUND, 1, "Record with id: " + id + " does not exist.");
        }
        var text = JSON.stringify(result, null, 2);
        response.getWriter().println(text);
    } catch(e){
        var errorCode = javax.servlet.http.HttpServletResponse.SC_BAD_REQUEST;
        entityLib.printError(errorCode, errorCode, e.message);
    } finally {
        connection.close();
    }
};

// read all entities and print them as JSON array to response
exports.readSubjectsList = function(limit, offset, sort, desc) {
    var connection = datasource.getConnection();
    try {
        var result = [];
        var sql = "SELECT ";
        if (limit !== null && offset !== null) {
            sql += " " + db.createTopAndStart(limit, offset);
        }
        sql += " * FROM SUBJECTS";
        if (sort !== null) {
            sql += " ORDER BY " + sort;
        }
        if (sort !== null && desc !== null) {
            sql += " DESC ";
        }
        if (limit !== null && offset !== null) {
            sql += " " + db.createLimitAndOffset(limit, offset);
        }
        var statement = connection.prepareStatement(sql);
        var resultSet = statement.executeQuery();
        var value;
        while (resultSet.next()) {
            result.push(createEntity(resultSet));
        }
        var text = JSON.stringify(result, null, 2);
        response.getWriter().println(text);
    } catch(e){
        var errorCode = javax.servlet.http.HttpServletResponse.SC_BAD_REQUEST;
        entityLib.printError(errorCode, errorCode, e.message);
    } finally {
        connection.close();
    }
};

//create entity as JSON object from ResultSet current Row
function createEntity(resultSet, data) {
    var result = {};
	result.id = resultSet.getInt("ID");
    result.name = resultSet.getString("NAME");
	result.level_id = resultSet.getInt("LEVEL_ID");
    return result;
}

function convertToDateString(date) {
    var fullYear = date.getFullYear();
    var month = date.getMonth() < 10 ? "0" + date.getMonth() : date.getMonth();
    var dateOfMonth = date.getDate() < 10 ? "0" + date.getDate() : date.getDate();
    return fullYear + "/" + month + "/" + dateOfMonth;
}

// update entity by id
exports.updateSubjects = function() {
    var input = ioLib.read(request.getReader());
    var message = JSON.parse(input);
    var connection = datasource.getConnection();
    try {
        var sql = "UPDATE SUBJECTS SET ";
        sql += "NAME = ?";
        sql += ",";
        sql += "LEVEL_ID = ?";
        sql += " WHERE ID = ?";
        var statement = connection.prepareStatement(sql);
        var i = 0;
        statement.setString(++i, message.name);
        statement.setInt(++i, message.level_id);
        var id = "";
        id = message.id;
        statement.setInt(++i, id);
        statement.executeUpdate();
        response.getWriter().println(id);
    } catch(e){
        var errorCode = javax.servlet.http.HttpServletResponse.SC_BAD_REQUEST;
        entityLib.printError(errorCode, errorCode, e.message);
    } finally {
        connection.close();
    }
};

// delete entity
exports.deleteSubjects = function(id) {
    var connection = datasource.getConnection();
    try {
        var sql = "DELETE FROM SUBJECTS WHERE "+pkToSQL();
        var statement = connection.prepareStatement(sql);
        statement.setString(1, id);
        var resultSet = statement.executeUpdate();
        response.getWriter().println(id);
    } catch(e){
        var errorCode = javax.servlet.http.HttpServletResponse.SC_BAD_REQUEST;
        entityLib.printError(errorCode, errorCode, e.message);
    } finally {
        connection.close();
    }
};

exports.countSubjects = function() {
    var count = 0;
    var connection = datasource.getConnection();
    try {
        var statement = connection.createStatement();
        var rs = statement.executeQuery('SELECT COUNT(*) FROM SUBJECTS');
        while (rs.next()) {
            count = rs.getInt(1);
        }
    } catch(e){
        var errorCode = javax.servlet.http.HttpServletResponse.SC_BAD_REQUEST;
        entityLib.printError(errorCode, errorCode, e.message);
    } finally {
        connection.close();
    }
    response.getWriter().println(count);
};

exports.metadataSubjects = function() {
	var entityMetadata = {};
	entityMetadata.name = 'subjects';
	entityMetadata.type = 'object';
	entityMetadata.properties = [];
	
	var propertyid = {};
	propertyid.name = 'id';
	propertyid.type = 'integer';
	propertyid.key = 'true';
	propertyid.required = 'true';
    entityMetadata.properties.push(propertyid);

	var propertyname = {};
	propertyname.name = 'name';
    propertyname.type = 'string';
    entityMetadata.properties.push(propertyname);

	var propertylevel_id = {};
	propertylevel_id.name = 'level_id';
	propertylevel_id.type = 'integer';
    entityMetadata.properties.push(propertylevel_id);


    response.getWriter().println(JSON.stringify(entityMetadata));
};

function getPrimaryKeys(){
    var result = [];
    var i = 0;
    result[i++] = 'ID';
    if (result === 0) {
        throw new Exception("There is no primary key");
    } else if(result.length > 1) {
        throw new Exception("More than one Primary Key is not supported.");
    }
    return result;
}

function getPrimaryKey(){
	return getPrimaryKeys()[0].toLowerCase();
}

function pkToSQL(){
    var pks = getPrimaryKeys();
    return pks[0] + " = ?";
}

exports.processSubjects = function() {
	
	// get method type
	var method = request.getMethod();
	method = method.toUpperCase();
	
	//get primary keys (one primary key is supported!)
	var idParameter = getPrimaryKey();
	
	// retrieve the id as parameter if exist 
	var id = xss.escapeSql(request.getParameter(idParameter));
	var count = xss.escapeSql(request.getParameter('count'));
	var metadata = xss.escapeSql(request.getParameter('metadata'));
	var sort = xss.escapeSql(request.getParameter('sort'));
	var limit = xss.escapeSql(request.getParameter('limit'));
	var offset = xss.escapeSql(request.getParameter('offset'));
	var desc = xss.escapeSql(request.getParameter('desc'));
	
	if (limit === null) {
		limit = 100;
	}
	if (offset === null) {
		offset = 0;
	}
	
	if(!entityLib.hasConflictingParameters(id, count, metadata)) {
		// switch based on method type
		if ((method === 'POST')) {
			// create
			exports.createSubjects();
		} else if ((method === 'GET')) {
			// read
			if (id) {
				exports.readSubjectsEntity(id);
			} else if (count !== null) {
				exports.countSubjects();
			} else if (metadata !== null) {
				exports.metadataSubjects();
			} else {
				exports.readSubjectsList(limit, offset, sort, desc);
			}
		} else if ((method === 'PUT')) {
			// update
			exports.updateSubjects();    
		} else if ((method === 'DELETE')) {
			// delete
			if(entityLib.isInputParameterValid(idParameter)){
				exports.deleteSubjects(id);
			}
		} else {
			entityLib.printError(javax.servlet.http.HttpServletResponse.SC_BAD_REQUEST, 1, "Invalid HTTP Method");
		}
	}
	
	// flush and close the response
	response.getWriter().flush();
	response.getWriter().close();
};
