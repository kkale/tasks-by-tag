var app = null;
var skillSet = [];

Ext.define('TaskEstimates', {
    
    extend: 'Rally.app.TimeboxScopedApp',

    scopeType: 'iteration',

    componentCls: 'app',
    
    onScopeChange: function(scope) {
    	console.log("IN scope change");
    	app = this;
    	skillSet = [{name:'.net', sum: 0}, {name: 'test', sum: 0}, {name:'ontwerp', sum:0}, {name: 'meetingpoint', sum: 0}];
		var qFilter = app.buildTagFilter(skillSet);
		console.log("Final filter: ", qFilter.toString());
		var iterationStore = Ext.create('Rally.data.wsapi.Store', {
		    model: 'Task',
		    fetch: ['Name', 'Tags', 'Estimate'],
		    filters: qFilter,
		    autoLoad: true,
		    listeners: {
		    	load: function(store, records) {

		    		_.each(records, function(record){
		    			
		    			var tagName = record.data.Tags._tagsNameArray[0].Name; 
		    			var estimate = record.data.Estimate;
		    			
		    			estimate = estimate === null ? 0 : estimate;

		    			_.each(skillSet, function(skill){
		    				console.log(tagName, ":", skill.name);
		    				if (skill.name == tagName) {
		    					skill.sum = skill.sum + estimate;
		    				}
		    			});
		    		});

		    		app.addCustomGrid();
		    	}
		    }
		});
    },

    buildTagFilter: function(skillSet) {
    	var iterationFilter = app.getContext().getTimeboxScope().getQueryFilter();
    	var tagFilter = Ext.create('Rally.data.wsapi.Filter', {			   
    			property: 'Name',
			    operator: '=',
			    value: 'Name'
			});
    	console.log("Skills: ", skillSet);
    	_.each(skillSet, function (skill){
    		console.log("skill", skill);
    		tagFilter = tagFilter.or(Ext.create('Rally.data.wsapi.Filter', {
			    property: 'tags.Name',
			    operator: '=',
			    value: skill['name']
			}));
    	});
    	console.log("filter: ", tagFilter.toString());
    	return iterationFilter.and(tagFilter);
    },

    addCustomGrid: function() {
    	var grid = this.down("rallygrid");
    	if (grid) {
    		grid.destroy();
    	}

    	app.add({
			xtype: 'rallygrid',
            showPagingToolbar: false,
            showRowActionsColumn: false,
            editable: false,
            store: Ext.create('Rally.data.custom.Store', {
            	data: skillSet
        	}),
           	columnCfgs: [
                {
                    text: 'Name',
                    dataIndex: 'name',
                    flex: 1
                },
                {
                    text: 'Total Estimate',
                    dataIndex: 'sum'
                }
            ]

    	});
    }
});
