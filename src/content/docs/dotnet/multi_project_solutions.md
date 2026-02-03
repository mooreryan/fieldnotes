---
title: Multi-Project Solutions in .NET
description: Using the .NET CLI program to set up a solution with multiple projects.
publishDate: 2026-02-02
lastUpdated: 2026-02-02
sidebar:
  label: Multi-Project Solutions
---

I have previously used JetBrains Rider when working on C# projects. However, I'm currently giving VS Code a try instead. The [.NET CLI](https://learn.microsoft.com/en-us/dotnet/core/tools/) program (`dotnet`) makes it pretty simple to manage projects and solutions, no fancy IDE needed!

Let's take a look at how to set up a solution with multiple projects using only the `dotnet` command.

First, create an empty solution file:

```
$ dotnet new sln -o SnazzySolution
```

Next, create a couple of projects. How about an empty [ASP.NET Core](https://dotnet.microsoft.com/en-us/apps/aspnet) app and a console app.

```
$ dotnet new web -o SnazzySolution/AwesomeWebApp
$ dotnet new console -o SnazzySolution/CoolConsoleApp
```

If you check out the solution file (`SnazzySolution/SnazzySolution.slnx`) now, you will see that it is still empty:

```xml
<Solution>
</Solution>
```

To fix that, we need to link the projects to the solution.

```
$ cd SnazzySolution
$ dotnet sln add AwesomeWebApp/AwesomeWebApp.csproj
$ dotnet sln add CoolConsoleApp/CoolConsoleApp.csproj
```

Check it out now:

```xml
<Solution>
  <Project Path="AwesomeWebApp/AwesomeWebApp.csproj" />
  <Project Path="CoolConsoleApp/CoolConsoleApp.csproj" />
</Solution>
```

Looks good. Now, you can do things like run projects from the solution root:

```
$ dotnet run --project CoolConsoleApp/CoolConsoleApp.csproj
Hello, World!
```

Nice!
