import type { FC } from "react"
import styles from "./Rules.module.css"
import { RouteTiles, StoneId } from "../../types"
import { Stone } from "../Game/Stone/Stone"
import { i18n } from "../../i18n/i18n"
import buttonStyles from "../Components/Button/Button.module.css"
import { useUIStore } from "../../Storage/UIStore/UIStoreProvider"
import { Tile } from "../Game/Tile/Tile"
import { observer } from "mobx-react"
import { useStore } from "../../Storage/Store/StoreProvider"
import { tileCountByName } from "../../Storage/Store/applyers/tileCountByName"

export const Rules: FC = observer(() => {
    const store = useStore()

    return (
        <div className={styles.root}>

            <div className={styles.stonesGrid}>
                <Stone id={StoneId.sapphire} isStatic />
                <div>
                    <span>Синий сапфир</span>
                    <span>приносит <b>3</b> очка</span>
                </div>
                <Stone id={StoneId.emerald0} isStatic />
                <div>
                    <span>Зелёный изумруд</span>
                    <span>приносит <b>2</b> очка</span>
                </div>
                <Stone id={StoneId.amber0} isStatic />
                <div>
                    <span>жёлтый янтарь</span>
                    <span>приносит <b>1</b> очко</span>
                </div>
            </div>

            <div className={styles.tilesGrid}>
                <Tile data={{ qr: "0,0", tile: RouteTiles.c }} />
                <div>{tileCountByName(store, "c")}/6</div>
                <Tile data={{ qr: "0,0", tile: RouteTiles["s-0"] }} />
                <div>{tileCountByName(store, "s")}/6</div>
                <Tile data={{ qr: "0,0", tile: RouteTiles["t-120"] }} />
                <div>{tileCountByName(store, "t")}/14</div>
                <Tile data={{ qr: "0,0", tile: RouteTiles["l-60"] }} />
                <div>{tileCountByName(store, "l")}/14</div>
                <Tile data={{ qr: "0,0", tile: RouteTiles["h-300"] }} />
                <div>{tileCountByName(store, "h")}/14</div>
            </div>

            <h3>Замысел и цель игры</h3>
            <p>
                В игре «Индиго» задача игроков – собрать наиболее ценные камни. Для этого им предстоит прокладывать
                пути, по которым камни будут двигаться к выходам, ведущим к воротам игроков, расположенным по краям
                игрового поля. Одни и те же ворота могут принадлежать только одному или двум игрокам сразу. В первом
                случае только один игрок получит добытый камень, а во втором – оба игрока будут вознаграждены,
                независимо от того, кто именно занес камень в ворота!
            </p>

            <h3>Игровой процесс</h3>
            <p>
                Левый верхний игрок начинает игру. Затем игра идёт по часовой стрелке. Действующий игрок кладёт плитку
                на
                поле, затем драгоценный камень перемещается и иногда игрок получает его. После этого происходит переход
                хода.
            </p>

            <h3>Размещение плитки</h3>
            <p>
                Игрок размещает свою плитку на любой свободный гекс игрового поля. Плитку можно положить отдельно от
                других
                плиток или так, чтобы она примыкала к уже находящимся на поле плиткам
                <span style={{ display: "block" }}>(Рис. 1).</span>
            </p>
            <p style={{ fontStyle: "italic" }}>
                <b>Исключение:</b> Не разрешается блокировать два выхода ворот, размещая плитку так, чтобы кривая
                дорожка
                упиралась сразу в два выхода
                <span style={{ display: "block" }}>(Рис. 2).</span>
            </p>

            <h3>Перемещение камней</h3>
            <p>
                Если драгоценный камень примыкает к дороге на только что выложенной плитке, он перемещается:
                <span style={{ display: "block" }}>(Рис. 3)</span>
                <span style={{ display: "block" }}>(Рис. 4)</span>
            </p>

            <h3>Плитка сокровищ</h3>
            <p>
                Если только что выложенная плитка примыкает своей стороной к плитке сокровищ, в месте отмеченном
                стрелкой,
                то находящийся там камень перемещается в направлении стрелки до конца образовавшегося пути. В случае с
                голубыми плитками сокровищ – перемещается жёлтый янтарь
                <span style={{ display: "block" }}>(Рис. 3).</span>
                В случае с синей центральной плиткой сокровищь, в первую очередь перемещаются зелёные изумруды – до тех
                пор,
                пока синий сапфир не останется в одиночестве
                <span style={{ display: "block" }}>(Рис. 4).</span>
                Сапфир всегда перемещается последним (по стандартным правилам перемещения камней).
            </p>

            <h3>Путевые плитки</h3>
            <p>
                Если только что выложенная плитка продлевает дорожку, на которой находится драгоценный камень (Рис. 5),
                камень перемещается до конца образовавшейся дорожки (Рис. 6). Камень всегда должен перемещаться по одной
                дороге: он не может делать резких поворотов или двигаться в обратном направлении. Если с только что
                выложенной плиткой граничат несколько камней, необходимо переместить их все (Рис. 7).
            </p>

            <p style={{ fontStyle: "italic" }}>
                <b>Примечание:</b> Если два камня сталкиваются на одной дорожке, они выбывают из игры (Рис. 8).
            </p>

            <h3>Получение камней</h3>
            <p>
                Если камень перемещается за край игрового поля, он достается игроку, в чьи ворота он попадает (Рис. 9).
                Если
                ворота принадлежат двум игрокам, второй игрок тоже получает камень (того же цвета) (Рис. 10).
            </p>
            <p>
                <b>Комментарий:</b> Если ворота принадлежат двум игрокам, они в равно мере владеют <b>всеми</b> 6
                выходами
                этих ворот. Независимо от того, через какой из выходов попадает камень, оба игрока получают по камню.
                Если
                ворота принадлежат только одному игроку, то и камень получит только он один.
            </p>

            <h3>Конец игры</h3>
            <p>
                Как только на поле не остаётся драгоценных камней, игра заканчивается.
            </p>
            <p>
                Игрок, набравший больше всех очков, становится победителем. В случае ничьи выигрывает тот претендент на
                победу, у которого больше камней. Если результат игроков снова равный, победа присуждается сразу
                нескольким
                игрокам.
            </p>

            <div style={{
                textAlign: "right",
                marginTop: "calc(var(--spacing) * 5)",
                marginBottom: "calc(var(--spacing) * 20)",
            }}>
                <button className={buttonStyles.button} onClick={useUIStore().closeDrawer}>
                    {i18n("button.close")}
                </button>
            </div>

        </div>
    )
})
