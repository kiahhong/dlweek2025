from pydantic_settings import BaseSettings, SettingsConfigDict
import configparser
import os

# Read config from ini file instead of json
config = configparser.ConfigParser()
config_path = os.path.join(os.getcwd(), "app", "model_config.ini")
config.read(config_path)

# Assuming 'parameters' is the section in your ini file
model_parameters = {
    key: config["parameters"][key].split(",") for key in config["parameters"]
}


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8")
    GEMINI_API: str
    SERPAPI_API: str


settings = Settings()
