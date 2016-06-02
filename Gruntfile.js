module.exports = function(grunt) {

    var releaseTag = "latest";

    var uploadCdnUrl = "http://161.27.213.108:9106/areas3-0.0.1/areas/services/cdn/";
        //"http://localhost:8090/areas3/areas/services/cdn/";
        //"http://161.27.213.108:9106/areas3-0.0.1/areas/services/cdn/";

    var engAppScripts = [

        "src/eng/engModule.js",
        "build/base64resources.js",

        "src/eng/appui/engApplicationDir.js",
        "src/eng/appui/engApplicationToolbar.js",
        "src/eng/appui/engApplicationMainMenu.js",
        "src/eng/appui/engApplicationMainMenuToolbar.js",

        "src/eng/engApplication.js",
        "src/eng/basicEntities.js",
        "src/eng/Activity.js",
        "src/eng/Page.js",
        "src/eng/engLoginManager.js",
        "src/eng/searchMenuCtrl.js",

        "src/eng/stdMainObjectPage/stdMainObjectPage.js",
        
        "src/eng/stdList/stdListCtrl.js",
        "src/eng/stdList/stdListConfigDir.js",
        "src/eng/stdList/loader/stdListDefaultLoader.js",
        "src/eng/stdList/loader/relation_1_N.js",

        "src/eng/stdEdit/stdEditCtrl.js",
        "src/eng/stdEdit/stdEditConfigDir.js",
        "src/eng/stdEdit/persister/stdEditDefaultPersister.js",
        "src/eng/stdEdit/persister/relation_1_N.js",
        "src/eng/stdEdit/persister/relation_1_1.js",
        "src/eng/stdEdit/persister/mainObjectPersister.js",

        "src/eng/stdDashboard/stdDashboardCtrl.js",
        "src/eng/stdDashboard/stdDashboardConfigDir.js",

        "src/eng/directives/engInclude.js",
        "src/eng/directives/engDisplayEntityProperty.js",
        "src/eng/directives/engEmbeddedActivity.js",

        "src/eng/fieldEditors/fieldsEditors.js",
        "src/eng/fieldEditors/boolean/engBooleanField.js",
        "src/eng/fieldEditors/number/engNumberField.js",
        "src/eng/fieldEditors/choice/engChoiceField.js",
        "src/eng/fieldEditors/date/engDateField.js",
        "src/eng/fieldEditors/definition/engDefinitionField.js",
        "src/eng/fieldEditors/form/engForm.js",
        "src/eng/fieldEditors/icon/engIconField.js",
        "src/eng/fieldEditors/list/engListField.js",
        "src/eng/fieldEditors/lookup/engLoolkupValue.js",
        "src/eng/fieldEditors/lookup/engLookupField.js",
        "src/eng/fieldEditors/code/codeEditField.js",
        "src/eng/fieldEditors/rawObject/engRawObjectEdit.js",
        "src/eng/fieldEditors/text/engTextField.js",
        "src/eng/fieldEditors/password/engPasswordField.js",
        "src/eng/fieldEditors/type/fieldTypeEditor.js",
        "src/eng/fieldEditors/innerbean/engInnerBeanField.js",
        "src/eng/fieldEditors/referencebean/referenceBeanField.js",
        "src/eng/fieldEditors/imgembedded/engImgEmbeddedField.js",
        "src/eng/fieldEditors/propertyTemplate/engPropertyTemplateField.js",

        "src/common/commonModule.js",
        "src/common/utilsModule.js",

        "src/data/datastore.js",
        "src/data/localstore.js",
        "src/data/mockdatastore.js",
        "src/data/restservicestore.js",
        "src/data/http.js",

        "src/login/loginModule.js",
        "src/login/login.js",

        "src/home/homeModule.js",
        "src/home/home.js",

        "src/config/configModule.js",
        "src/config/configServ.js",
        "src/config/configCtrl.js",
        "src/config/themeEdit.js",

        "src/develop/developModule.js",

        "src/users/usersModule.js",

        "<%= ngtemplates.app.dest %>"
    ];

    var libsScripts = [
        //jquery and jqueryUI
        "libs/jquery-1.12.1.min.js",
        "libs/jquery-ui-1.11.4.min.js",

        "libs/ace/ace.js",

        // Angular Material requires Angular.js Libraries -->
        "libs/angular.min.js",
        "libs/angular-sanitize.min.js",
        "libs/angular-animate.min.js",
        "libs/angular-aria.min.js",
        "libs/angular-route.min.js",
        "libs/angular-translate.min.js",
        "libs/angular-translate-loader-static-files.min.js",

        "libs/angular-ui-ace/ui-ace.min.js",

        //Angular Material Library -->
        "libs/angular-material.min.js",
        "libs/angular-material-icons.min.js",

        //requirejs
        "libs/require_2.2.0.js",

        //ace modes
        "libs/ace/mode-html.js",
        "libs/ace/mode-javascript.js",
        "libs/ace/snippets/html.js",
        "libs/ace/snippets/javascript.js"
    ];

    var allTemplates = [
        "**/*.html"
    ];

    var styleFiles = [
        'libs/angular-material.min.css',
        'src/engApp.css'
    ];

    var allScriptsWithLibs = libsScripts.concat(engAppScripts);

    var uploadOptions = function(filePath,uploadName,encode) {
        var parts = filePath.split("/");
        var fileName = parts[parts.length-1];
        return {
            options: {
                url: uploadCdnUrl+(uploadName||fileName),
                    method: 'POST',
                    body: function () {
                        return grunt.file.read(filePath,{
                            encoding: (encode===false)?null:'utf8'
                        });
                    },
                    encoding: 'utf8',
                    callback: function(error, response , body) {
                    console.log("upload ",filePath," => ",body);
                }
            }
        };
    };

    var encodeBase64ResourcesTask = function(fs, jsFile, done) {
        var glob = grunt.file.glob;
        var _ = grunt.util._;
        var q = require('q');
        var path = require('path');

        fs.writeSync(jsFile, '// this file is auto-generated.  DO NOT MODIFY\n');
        fs.writeSync(jsFile, "angular.module('engModule')\n\n");
        fs.writeSync(jsFile, "  .factory('staticAppResources',[function(){\n");
        fs.writeSync(jsFile, "      var service = {\n");

        var promises = [];

        glob('resources/**/*.*', function (err, resFiles) {

            _.each(resFiles, function(resFile,index) {

                var deferred = q.defer();
                promises.push(deferred.promise);

                var resName = path.relative('resources', resFile).replace(/\\/g,"-");
                var extname = path.extname(resFile).substring(1);
                resName = resName.substring(0,resName.length-extname.length-1);

                fs.readFile(resFile, function(err, resFileData) {
                    var base64data = new Buffer(resFileData).toString('base64');
                    fs.writeSync(jsFile, "          \""+resName+"\": {\n");
                    fs.writeSync(jsFile, "              \"data\": \""+base64data+"\",\n");
                    fs.writeSync(jsFile, "              \"type\": \""+extname+"\",\n");
                    fs.writeSync(jsFile, "           },\n");
                    deferred.resolve(true);
                });

            });

            q.all(promises).then(function(){
                fs.writeSync(jsFile, "      };\n");
                fs.writeSync(jsFile, "      return service;\n");
                fs.writeSync(jsFile, "  }])\n");
                fs.writeSync(jsFile, ";");
                done();
            });
        });
    };

    // Project configuration.
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        concat_css: {
            options: {},
            all: {
                src: styleFiles,
                dest: 'build/engApp-all-'+releaseTag+'.css'
            },
        },
        ngtemplates: {
            app: {
                cwd: "src",
                src: allTemplates,
                dest: 'build/templates-all-'+releaseTag+'.js',
                options: {
                    module: 'engModule',
                    prefix: '/eng-app-src/'	
                }
            }
        },
        concat: {
            allFiles: {
                src: engAppScripts,
                dest: 'build/engApp-all-'+releaseTag+'.js',
            },
            allWithDeps: {
                src: allScriptsWithLibs,
                dest: 'build/engApp-allWithLibs-'+releaseTag+'.js'
            }
        },
        http: {
            cdnUploadLib: uploadOptions('build/engApp-allWithLibs-'+releaseTag+'.js'),
            cdnUploadCss: uploadOptions('build/engApp-all-'+releaseTag+'.css')
        },
        docular: {
            baseUrl: '/engApp/docs/',
            docular_webapp_target: 'docs',
            targetDir: 'docs',
            groups: [{
                groupTitle: 'EngApp',
                groupId: 'engapp',
                groupIcon: 'icon-beer',
                showSource: true,
                sections: [{
                    id: "engapp-startup",
                    title: "Startup EngApp",
                    showSource: false,
                    docs: [
                        "docs-source/startup.md"
                    ],
                    rank: {}
                },{
                    id: "engapp-navigation",
                    title: "Navigation EngApp",
                    showSource: false,
                    docs: [
                        "lib/scripts/docs/install"
                    ],
                    rank: {}
                }]
            }],
            showDocularDocs: true,
            showAngularDocs: false
        },
        'file-creator': {
            options: {
                openFlags: 'w'
            },
            folder: {
                "build/base64resources.js": encodeBase64ResourcesTask
            }
        }
    });

    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-angular-templates');
    grunt.loadNpmTasks('grunt-concat-css');

    // Load the plugin that provides the "docular" tasks.
    grunt.loadNpmTasks('grunt-docular');

    grunt.loadNpmTasks('grunt-http');
    grunt.loadNpmTasks('grunt-contrib-compress');
    grunt.loadNpmTasks('grunt-file-creator');

    // Default task(s).
    grunt.registerTask('default', ['concat_css','ngtemplates','concat']);
    grunt.registerTask('resources', ['file-creator']);
    grunt.registerTask('release', ['file-creator','default','http']);

};