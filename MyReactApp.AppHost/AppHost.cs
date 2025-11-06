var builder = DistributedApplication.CreateBuilder(args);

var apiService = builder.AddProject<Projects.MyReactApp_api>("apiservice");

builder.AddViteApp("frontend", "../myreactapp.web")
        .WithReference(apiService)
        .WaitFor(apiService);

builder.Build().Run();
