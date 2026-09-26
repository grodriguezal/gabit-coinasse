import prepare_seo_core as core
from integrate_spacex import main as integrate_spacex
from integrate_tokenizacion import main as integrate_tokenizacion

if __name__ == "__main__":
    core.clean_chatgpt_artifacts()
    core.clean_editorial_tone()
    core.integrate_latest_post()
    integrate_spacex()
    integrate_tokenizacion()
    core.clean_index_links()
    core.update_sitemap_lastmod()
