var builder = DistributedApplication.CreateBuilder(args);

// Add the following line to configure the Docker Compose environment
builder.AddDockerComposeEnvironment("env");

var apiService = builder.AddProject<Projects.MyAngularApp_api>("apiserviceangular")
                        .WithHttpHealthCheck("/health")
                        .WithExternalHttpEndpoints();

var frontend = builder.AddJavaScriptApp("frontendangular", "../myangularapp.web", "start")
                        .WithReference(apiService)
                        .WaitFor(apiService)
                        .WithHttpEndpoint(env: "PORT")
                        .WithExternalHttpEndpoints()
                        .PublishAsDockerFile();

apiService.PublishWithContainerFiles(frontend, "./wwwroot");

builder.Build().Run();
