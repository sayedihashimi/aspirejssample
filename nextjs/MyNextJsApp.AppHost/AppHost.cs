var builder = DistributedApplication.CreateBuilder(args);

// Add the following line to configure the Docker Compose environment
builder.AddDockerComposeEnvironment("env");

var apiService = builder.AddProject<Projects.MyNextJsApp_api>("apiservicenextjs")
                        .WithHttpHealthCheck("/health")
                        .WithExternalHttpEndpoints();

var frontend = builder.AddJavaScriptApp("frontendnextjs", "../mynextjsapp.web", "dev")
                        .WithReference(apiService)
                        .WaitFor(apiService)
                        .WithHttpEndpoint(env: "PORT")
                        .WithExternalHttpEndpoints()
                        .PublishAsDockerFile();

apiService.PublishWithContainerFiles(frontend, "./wwwroot");

builder.Build().Run();
