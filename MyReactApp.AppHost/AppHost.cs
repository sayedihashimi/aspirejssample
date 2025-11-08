var builder = DistributedApplication.CreateBuilder(args);

var apiService = builder.AddProject<Projects.MyReactApp_api>("apiservice")
                        .WithHttpHealthCheck("/health");

var frontend = builder.AddViteApp("frontend", "../myreactapp.web")
                        .WithReference(apiService)
                        .WaitFor(apiService);

apiService.PublishWithContainerFiles(frontend, "./static");

builder.Build().Run();
