# Dev-focused Dockerfile for Cheersly.Api
# - Uses the .NET SDK so the container can build and run the app from mounted source.
# - Works with docker-compose.yml which mounts ./src/api -> /app and maps host 5000 -> container 80.

FROM mcr.microsoft.com/dotnet/sdk:10.0 AS dev
WORKDIR /app

# Ensure the SDK uses port 80 inside the container
ENV ASPNETCORE_URLS=http://+:80

# Copy csproj(s) first to leverage docker layer cache for restores
COPY ./Cheersly.Api/*.csproj ./Cheersly.Api/
RUN dotnet restore ./Cheersly.Api/Cheersly.Api.csproj

# Copy the rest of the source. During development docker-compose mounts the host
# ./src/api over /app, but copying here helps when building the image without mounts
COPY . .

WORKDIR /app/Cheersly.Api

EXPOSE 80

# Use dotnet watch in development so code changes in the mounted volume are picked up
CMD ["dotnet", "watch", "run", "--urls", "http://0.0.0.0:80"]

### The following is an optional production-style build stage you can enable later.
### To produce a smaller runtime image, replace the above with a multi-stage build:
###
### FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
### WORKDIR /src
### COPY ./Cheersly.Api/*.csproj ./Cheersly.Api/
### RUN dotnet restore ./Cheersly.Api/Cheersly.Api.csproj
### COPY . .
### RUN dotnet publish ./Cheersly.Api/Cheersly.Api.csproj -c Release -o /app/publish
###
### FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS runtime
### WORKDIR /app
### COPY --from=build /app/publish ./
### ENV ASPNETCORE_URLS=http://+:80
### EXPOSE 80
### ENTRYPOINT ["dotnet", "Cheersly.Api.dll"]
