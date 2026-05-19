/* eslint-disable jsx-a11y/alt-text */
import {
  Document,
  Image,
  Page,
  Path,
  StyleSheet,
  Svg,
  Text,
  View,
} from "@react-pdf/renderer";
import {
  COMPLEXIDADES_LABEL,
  FATORES_LABEL,
  TIPOS_SERVICO_LABEL,
  type RascunhoOrcamento,
} from "./types";

// Pintor Pro IA palette
const C = {
  black:       "#000000",
  sheetBg:     "#0a0a0a",
  sheetElev:   "#131316",
  primary:     "#00B8E6",
  primaryInk:  "#001218",
  white:       "#ffffff",
  zinc100:     "#f4f4f5",
  zinc200:     "#e4e4e7",
  zinc300:     "#d4d4d8",
  zinc400:     "#a1a1aa",
  zinc500:     "#71717a",
  zinc600:     "#52525b",
  zinc900:     "#18181b",
  divider:     "#27272a",
  textMuted:   "rgba(255,255,255,0.55)",
  textDim:     "rgba(255,255,255,0.40)",
  textBody:    "rgba(255,255,255,0.85)",
  termItem:    "rgba(255,255,255,0.70)",
  invLabel:    "rgba(0,18,24,0.65)",
  invCurrency: "rgba(0,18,24,0.50)",
};

const s = StyleSheet.create({
  page: {
    backgroundColor: C.sheetBg,
    color: C.zinc100,
    fontSize: 11,
    fontFamily: "Helvetica",
  },

  // ── Header ──────────────────────────────────────────────
  header: {
    backgroundColor: C.black,
    paddingTop: 42,
    paddingBottom: 30,
    paddingHorizontal: 48,
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    borderBottomWidth: 1,
    borderBottomColor: C.divider,
  },
  headerTitle: {
    fontSize: 38,
    fontFamily: "Helvetica-Bold",
    color: C.white,
    lineHeight: 0.95,
    marginBottom: 5,
  },
  headerSubtitle: {
    fontSize: 14,
    color: C.primary,
  },
  headerDateLabel: {
    fontSize: 10,
    color: C.textMuted,
    textAlign: "right",
  },
  headerDateValue: {
    fontSize: 14,
    fontFamily: "Helvetica-Bold",
    color: C.white,
    textAlign: "right",
    marginTop: 2,
  },

  // ── Body ────────────────────────────────────────────────
  body: {
    paddingHorizontal: 48,
    paddingTop: 36,
    paddingBottom: 28,
    flexGrow: 1,
  },

  intro: {
    fontSize: 13,
    color: C.textBody,
    lineHeight: 1.45,
    marginBottom: 28,
  },
  introBold: {
    fontFamily: "Helvetica-Bold",
    color: C.white,
  },

  // ── Services list ────────────────────────────────────────
  servicesCard: {
    borderWidth: 1,
    borderColor: C.divider,
    borderRadius: 4,
    backgroundColor: C.sheetElev,
    marginBottom: 20,
    overflow: "hidden",
  },
  servicesHead: {
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderBottomWidth: 1,
    borderBottomColor: C.divider,
    backgroundColor: C.sheetElev,
    fontSize: 9,
    fontFamily: "Helvetica-Bold",
    textTransform: "uppercase",
    letterSpacing: 0.8,
    color: C.primary,
  },
  serviceItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 13,
    paddingHorizontal: 15,
    borderBottomWidth: 1,
    borderBottomColor: C.divider,
  },
  serviceItemLast: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 13,
    paddingHorizontal: 15,
  },
  serviceDot: {
    width: 5,
    height: 5,
    borderRadius: 999,
    backgroundColor: C.primary,
    marginRight: 12,
  },
  serviceText: {
    fontSize: 12,
    color: C.zinc100,
  },

  // ── Investimento ─────────────────────────────────────────
  investimento: {
    backgroundColor: C.primary,
    borderRadius: 10,
    paddingVertical: 20,
    paddingHorizontal: 24,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 24,
  },
  invLabel: {
    fontSize: 9,
    fontFamily: "Helvetica-Bold",
    textTransform: "uppercase",
    letterSpacing: 0.8,
    color: C.invLabel,
  },
  invValueRow: {
    flexDirection: "row",
    alignItems: "baseline",
  },
  invCurrency: {
    fontSize: 14,
    fontFamily: "Helvetica-Bold",
    color: C.invCurrency,
    marginRight: 4,
  },
  invValue: {
    fontSize: 28,
    fontFamily: "Helvetica-Bold",
    color: C.primaryInk,
  },

  // ── Observações ──────────────────────────────────────────
  obsCard: {
    borderWidth: 1,
    borderColor: C.divider,
    borderRadius: 4,
    backgroundColor: C.sheetElev,
    marginBottom: 20,
    overflow: "hidden",
  },
  obsHead: {
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderBottomWidth: 1,
    borderBottomColor: C.divider,
    fontSize: 9,
    fontFamily: "Helvetica-Bold",
    textTransform: "uppercase",
    letterSpacing: 0.8,
    color: C.textMuted,
  },
  obsText: {
    paddingVertical: 13,
    paddingHorizontal: 15,
    fontSize: 11,
    color: C.termItem,
    lineHeight: 1.5,
  },

  // ── Terms ────────────────────────────────────────────────
  termsTitle: {
    fontSize: 9,
    fontFamily: "Helvetica-Bold",
    textTransform: "uppercase",
    letterSpacing: 0.8,
    color: C.textMuted,
    marginBottom: 10,
  },
  termsGrid: {
    flexDirection: "column",
    flexWrap: "wrap",
  },
  termItem: {
    width: "50%",
    flexDirection: "row",
    alignItems: "flex-start",
    paddingLeft: 10,
    paddingRight: 16,
    marginBottom: 8,
    position: "relative",
  },
  termDash: {
    position: "absolute",
    left: 0,
    top: 5,
    width: 5,
    height: 1,
    backgroundColor: C.zinc500,
  },
  termText: {
    fontSize: 10,
    color: C.termItem,
    lineHeight: 1.45,
  },

  // ── Footer ───────────────────────────────────────────────
  footer: {
    borderTopWidth: 1,
    borderTopColor: C.divider,
    paddingTop: 18,
    paddingBottom: 28,
    paddingHorizontal: 48,
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
  },
  footerLeft: {
    flexDirection: "column",
    gap: 4,
  },
  footerPintor: {
    fontSize: 10,
    fontFamily: "Helvetica-Bold",
    color: C.zinc300,
  },
  footerContato: {
    fontSize: 9,
    color: C.textMuted,
  },
  footerMeta: {
    fontSize: 9,
    color: C.textDim,
    textAlign: "right",
    maxWidth: 220,
    lineHeight: 1.5,
  },
  logoImg: {
    width: 90,
    objectFit: "contain",
  },
});

function LogoPDF({ width = 90 }: { width?: number }) {
  const height = Math.round(width * (360 / 1040));
  return (
    <Svg width={width} height={height} viewBox="0 0 1040 360">
      <Path d="M442.27 175.496C442.27 182.31 442.27 189.125 442.27 196.611C434.522 196.611 427.522 196.889 420.571 196.423C418.741 196.3 416.871 194.061 415.347 192.479C386.803 162.864 358.312 133.199 329.799 103.555C328.612 102.321 327.324 101.186 325.283 99.2438C325.283 132.09 325.283 163.926 325.283 196.194C316.545 196.194 308.378 196.194 299.834 196.194C299.834 148.804 299.834 101.389 299.834 53.2042C306.824 53.2042 313.786 53.0396 320.728 53.3407C322.147 53.4022 323.686 55.025 324.84 56.2407C352.681 85.5492 380.468 114.908 408.297 144.228C410.178 146.209 412.303 147.96 414.314 149.818C414.881 149.684 415.447 149.551 416.013 149.418C416.013 145.753 416.013 142.088 416.036 137.466C415.951 127.041 415.843 117.572 415.845 107.685C415.894 104.311 415.833 101.355 415.903 97.9698C415.949 96.0577 415.863 94.5747 415.889 92.6344C415.931 89.6729 415.861 87.1686 415.922 84.2373C415.943 74.7353 415.832 65.6604 415.722 56.5855C416.342 50.9314 420.797 53.9573 424.224 53.1565C426.14 53.0964 427.38 53.008 428.621 52.9196C431.863 53.0057 435.128 52.8929 438.335 53.2761C439.615 53.429 440.764 54.6765 441.931 56.1227C442.004 57.2905 442.12 57.7614 442.117 58.6688C442.104 62.0574 442.209 65.0095 442.147 68.4104C442.088 72.7003 442.196 76.5415 442.205 80.7142C442.159 81.7313 442.212 82.4169 442.12 83.5406C442.07 89.4828 442.164 94.9867 442.131 100.972C442.092 112.758 442.179 124.062 442.124 135.802C442.077 138.055 442.171 139.873 442.15 142.175C442.111 151.496 442.189 160.334 442.126 169.607C442.08 171.861 442.175 173.678 442.27 175.496Z" fill="#F8F8F8" />
      <Path d="M889.184 196.593C885.144 196.571 881.625 196.556 878.106 196.51C877.784 196.505 877.464 196.299 876.768 196.056C876.768 148.757 876.768 101.336 876.768 53.5843C878.131 53.4624 879.489 53.2352 880.847 53.2349C907.076 53.2294 933.305 53.1282 959.533 53.3025C983.107 53.4592 1002.49 68.2663 1008 89.9553C1014.1 113.963 1003.14 135.353 980.107 144.405C979.325 144.712 978.558 145.053 977.062 145.682C988.553 162.513 999.876 179.097 1011.81 196.581C1001.26 196.581 991.836 196.668 982.419 196.471C981.228 196.447 979.712 195.176 978.949 194.068C969.486 180.314 960.172 166.457 950.7 152.709C949.717 151.281 947.987 149.406 946.575 149.383C932.015 149.138 917.448 149.233 902.289 149.233C902.289 165.148 902.289 180.56 902.289 196.593C897.702 196.593 893.703 196.593 889.184 196.593ZM982.902 102.057C981.564 87.4745 973.205 79.4889 958.475 79.2697C943.52 79.0471 928.559 79.2046 913.601 79.1967C909.967 79.1948 906.334 79.1964 902.457 79.1964C902.457 94.5654 902.457 109.24 902.457 124.152C922.448 124.152 942.143 124.792 961.77 123.922C974.405 123.363 981.205 115.481 982.902 102.057Z" fill="#F8F8F9" />
      <Path d="M810.404 85.239C840.15 131.258 811.923 190.29 760.154 197.455C760.154 189.387 759.988 181.4 760.343 173.437C760.393 172.315 762.842 170.98 764.42 170.296C779.514 163.755 790.115 153.103 794.115 136.907C801.065 108.765 782.242 82.1144 752.264 77.1908C722.469 72.2973 696.04 91.2244 692.09 120.284C689.36 140.368 701.921 161.753 721.616 169.661C725.811 171.345 727.021 173.433 726.795 177.663C726.449 184.126 726.704 190.622 726.704 197.724C702.298 192.779 683.669 180.622 672.989 158.635C648.404 108.021 684.429 51.6032 741.519 50.6457C770.348 50.1622 793.487 61.0908 810.404 85.239Z" fill="#F8F8F9" />
      <Path d="M139.075 140.564C129.184 147.518 118.279 149.776 106.842 149.87C92.0662 149.991 77.2886 149.867 62.5119 149.85C59.7372 149.847 56.9625 149.85 53.7261 149.85C53.7261 165.702 53.7261 180.938 53.7261 196.406C45.0506 196.406 36.8437 196.406 28.2507 196.406C28.2507 148.788 28.2507 101.247 28.2507 53.1789C30.926 53.1789 33.3541 53.1788 35.7822 53.1789C59.3551 53.18 82.9306 52.9586 106.5 53.2494C127.002 53.5023 143.55 61.4042 152.878 80.5296C163.246 101.788 157.556 125.805 139.075 140.564ZM120.952 83.1739C115.56 81.8547 110.215 79.6975 104.767 79.3931C93.8854 78.7851 82.9467 79.1909 72.0314 79.1822C66.1008 79.1776 60.1703 79.1815 53.9824 79.1815C53.9824 94.5284 53.9824 109.209 53.9824 123.799C73.5836 123.799 92.9079 124.356 112.177 123.562C121.67 123.171 128.641 117.164 130.798 107.481C132.967 97.7482 130.313 89.3688 120.952 83.1739Z" fill="#F9F9F9" />
      <Path d="M544.693 184.982C544.701 149.655 544.701 114.853 544.701 79.4955C528.147 79.4955 511.89 79.4955 495.261 79.4955C495.261 70.615 495.261 62.2807 495.261 53.5399C537.162 53.5399 579.076 53.5399 621.401 53.5399C621.401 61.9571 621.401 70.2694 621.401 79.1272C604.684 79.1272 588.062 79.1272 570.832 79.1272C570.832 118.418 570.832 157.176 570.832 196.277C562.031 196.277 553.836 196.277 544.685 196.277C544.685 192.697 544.685 189.101 544.693 184.982Z" fill="#F8F8F8" />
      <Path d="M236.601 53.772C237.013 76.292 237.121 98.4626 237.159 120.633C237.2 143.868 237.175 167.102 237.178 190.337C237.178 192.225 237.178 194.113 237.178 196.317C228.42 196.317 220.251 196.317 211.892 196.317C211.892 148.67 211.892 101.223 211.892 53.4227C220.187 53.4227 228.226 53.4227 236.601 53.772Z" fill="#F8F8F9" />
      <Path d="M431.238 305.824C430.988 307.115 430.603 308.905 430.045 308.96C423.401 309.62 416.587 310.654 413.184 302.457C412.344 300.433 409.985 299.07 409.003 297.07C403.822 286.526 395.18 284.134 384.225 285.097C379.236 285.535 377.888 287.133 378.089 291.682C378.335 297.263 378.147 302.862 378.147 308.811C373.81 308.811 370.039 308.811 365.797 308.811C365.797 285.501 365.797 262.257 365.797 239.181C381.21 239.181 396.339 238.431 411.347 239.452C420.907 240.102 427.873 246.343 430.452 256.008C432.85 264.993 431.167 273.189 423.706 279.422C421.575 281.202 418.975 282.419 415.764 284.406C420.87 291.471 425.946 298.494 431.238 305.824ZM378.062 255.591C378.056 260.327 378.162 265.067 378.004 269.798C377.903 272.797 379.16 273.813 382.048 273.769C389.764 273.649 397.49 273.913 405.198 273.632C413.098 273.345 417.95 268.869 417.955 262.475C417.961 255.679 413.032 250.946 405.178 250.71C397.466 250.479 389.741 250.742 382.026 250.587C379.01 250.526 377.838 251.742 378.062 255.591Z" fill="#09B3ED" />
      <Path d="M539.873 251.232C548.64 263.843 550.387 277.059 543.407 290.364C536.241 304.025 523.99 310.183 508.713 310.344C487.042 310.574 471.658 298.818 468.206 279.506C465.288 263.177 473.929 247.424 489.283 241.083C507.802 233.435 526.357 237.066 539.873 251.232ZM505.566 249.739C503.831 250.013 502.079 250.21 500.362 250.576C490.834 252.606 482.94 260.331 481.488 268.99C479.677 279.785 483.346 289.172 492.109 293.864C502.206 299.27 512.747 299.452 522.824 293.721C535.915 286.275 538.244 268.983 527.873 258.049C522.065 251.924 514.777 249.469 505.566 249.739Z" fill="#09B3ED" />
      <Path d="M263.411 276.915C263.41 263.953 263.41 251.519 263.41 239.461C278.902 239.461 293.82 238.759 308.63 239.717C317.971 240.32 325.434 249.016 326.878 257.81C328.67 268.724 324.763 278.129 315.456 282.758C311.368 284.792 306.429 285.599 301.799 285.945C294.802 286.469 287.735 286.239 280.704 286.058C277.272 285.97 276.004 287.198 276.11 290.624C276.293 296.568 276.161 302.521 276.161 308.852C271.923 308.852 268.143 308.852 263.413 308.852C263.413 298.375 263.413 287.909 263.411 276.915ZM289.68 250.661C285.361 250.661 281.042 250.661 276.108 250.661C276.108 257.764 275.937 264.226 276.271 270.661C276.328 271.768 278.499 273.619 279.751 273.668C287.105 273.954 294.481 273.977 301.841 273.759C309.543 273.53 314.155 269.066 314.238 262.261C314.313 256.008 309.571 251.313 302.298 250.784C298.458 250.505 294.584 250.686 289.68 250.661Z" fill="#09B3ED" />
      <Path d="M744.422 294.761C736.165 294.764 728.426 294.952 720.701 294.698C717.206 294.582 714.961 295.576 713.876 298.931C713.716 299.427 713.413 299.877 713.177 300.348C708.155 310.345 707.675 310.572 695.221 308.452C696.168 306.171 696.952 303.922 698.004 301.807C708.012 281.694 718.011 261.576 728.216 241.564C728.963 240.098 731.235 238.649 732.893 238.532C743.061 237.813 743.005 237.973 747.39 247.024C756.423 265.666 765.537 284.268 774.6 302.895C775.423 304.585 776.121 306.337 777.302 309.031C772.754 309.031 768.968 309.164 765.204 308.942C764.207 308.883 763.193 307.824 762.346 307.049C761.865 306.609 761.576 305.845 761.424 305.177C759.388 296.212 753.681 293.102 744.422 294.761ZM746.958 274.927C743.642 268.052 740.327 261.178 736.527 253.3C731.299 263.599 726.67 272.718 721.745 282.421C731.607 282.421 740.589 282.421 750.279 282.421C749.108 279.728 748.22 277.685 746.958 274.927Z" fill="#09B3ED" />
      <Path d="M920.876 267.551C950.735 267.564 980.065 267.564 1009.33 267.564C1010.82 274.389 1010.61 274.653 1003.98 274.657C947.888 274.694 891.793 274.679 835.699 274.848C829.904 274.865 830.493 271.838 831.303 267.538C861.033 267.538 890.691 267.538 920.876 267.551Z" fill="#11ABD6" />
      <Path d="M196.025 267.522C199.817 267.522 203.114 267.522 206.341 267.522C207.67 274.269 207.426 274.685 201.359 274.688C151.047 274.713 100.735 274.704 50.4237 274.705C43.0685 274.706 35.7132 274.705 28 274.705C28 272.192 28 270.164 28 267.522C83.8432 267.522 139.687 267.522 196.025 267.522ZM116.433 269.45C89.5007 269.451 62.568 269.434 35.6355 269.494C33.883 269.498 32.1317 270.088 30.3799 270.406C35.4286 273.707 201.592 273.234 204.412 269.451C175.438 269.451 146.464 269.451 116.433 269.45Z" fill="#1BA2C3" />
      <Path d="M657.366 240.68C657.412 263.561 657.412 285.989 657.412 308.04C656.406 308.586 656.12 308.855 655.803 308.897C644.335 310.409 644.402 310.394 644.451 299.02C644.528 281.28 644.481 263.54 644.486 245.8C644.487 243.563 644.486 241.327 644.486 237.621C649.375 238.614 653.347 239.421 657.366 240.68Z" fill="#09B3ED" />
      <Path d="M737.642 139.246C731.235 135.136 728.923 130.152 730.31 124.052C731.564 118.538 735.798 114.725 741.667 113.824C749.705 112.591 756.211 117.808 756.911 126.049C757.563 133.707 751.862 140.278 744.191 140.44C742.138 140.484 740.07 139.784 737.642 139.246Z" fill="#09B3ED" />
      <Path d="M415.244 56.4712C415.832 65.6604 415.943 74.7353 415.535 84.3404C413.392 87.7845 412.262 90.6529 415.777 93.0918C415.863 94.5747 415.949 96.0577 415.507 98.0813C413.357 101.932 412.508 105.181 415.735 108.104C415.843 117.572 415.951 127.041 415.925 136.988C411.326 136.868 411.657 133.661 411.668 130.335C411.742 107.393 411.674 84.4508 411.76 61.5088C411.768 59.4316 410.417 56.0968 415.244 56.4712Z" fill="#101010" />
      <Path d="M442.303 80.3827C442.196 76.5415 442.088 72.7003 442.639 68.2492C444.432 64.3355 446.343 60.9439 442.235 58.2323C442.12 57.7614 442.004 57.2904 442.04 56.4821C445.771 55.8316 445.511 58.2975 445.507 60.6543C445.488 71.9023 445.5 83.1503 445.499 94.3983C445.499 125.506 445.498 156.614 445.497 187.722C445.497 189.613 445.497 191.505 445.497 193.396C445.147 193.393 444.798 193.39 444.448 193.387C444.448 189.059 444.565 184.726 444.387 180.405C444.321 178.817 443.559 177.257 442.692 175.59C442.175 173.678 442.08 171.861 442.548 169.513C443.519 168.473 444.276 167.968 444.283 167.453C444.387 159.667 444.455 151.879 444.325 144.095C444.312 143.282 442.984 142.492 442.266 141.691C442.171 139.873 442.077 138.055 442.547 135.708C443.545 134.495 444.349 133.814 444.355 133.126C444.444 123.226 444.486 113.323 444.337 103.424C444.322 102.436 442.982 101.468 442.257 100.491C442.164 94.9867 442.07 89.4828 442.559 83.5821C442.862 82.2511 442.583 81.3169 442.303 80.3827Z" fill="#101010" />
      <Path d="M523.671 82.5439C514.209 82.5441 505.276 82.5441 496.342 82.5441C496.341 82.1899 496.34 81.8358 496.339 81.4816C506.795 81.4816 517.252 81.428 527.708 81.506C532.422 81.5412 539.141 80.0458 541.322 82.4869C543.855 85.3213 542.638 91.7128 542.65 96.5613C542.725 126.659 542.688 156.757 542.688 186.854C542.688 188.588 542.688 190.323 542.688 192.057C542.335 192.07 541.982 192.084 541.629 192.098C541.629 190.421 541.629 188.745 541.629 187.068C541.63 154.155 541.535 121.24 541.738 88.3277C541.767 83.6397 540.476 82.0059 535.808 82.4656C531.973 82.8432 528.071 82.5433 523.671 82.5439Z" fill="#101010" />
      <Path d="M594.451 82.5425C587.454 82.5425 580.985 82.5425 574.517 82.5425C574.518 82.2915 574.52 82.0406 574.522 81.7897C589.136 81.7897 603.75 81.7897 618.365 81.7897C618.374 82.0406 618.383 82.2915 618.392 82.5425C610.588 82.5425 602.784 82.5425 594.451 82.5425Z" fill="#101010" />
      <Path d="M116.962 269.451C146.464 269.451 175.438 269.451 204.413 269.451C201.592 273.234 35.4286 273.707 30.3799 270.406C32.1318 270.088 33.883 269.498 35.6355 269.494C62.5681 269.434 89.5008 269.451 116.962 269.451Z" fill="#09B3ED" />
    </Svg>
  );
}

const formatBRL = (n: number) =>
  n.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const formatDate = (d: Date) =>
  d.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" });

function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

export function OrcamentoPdf({ rascunho }: { rascunho: RascunhoOrcamento }) {
  const { dados, descricao, perfil } = rascunho;

  const validadeDias = rascunho.validade_dias ?? 20;
  const validadeData = formatDate(addDays(new Date(), validadeDias));

  const defaultCondicoes = [
    "O prazo para finalização dos serviços é de 15 dias úteis.",
    "Para início do trabalho recebemos 20% do valor antecipado.",
  ];

  const terms = [
    ...(perfil?.condicoes?.length ? perfil.condicoes : defaultCondicoes),
    `Este orçamento tem validade até ${validadeData}.`,
  ];

  const cliente = rascunho.nome_cliente?.trim() || "o(a) cliente";

  const serviceItems: string[] = [
    TIPOS_SERVICO_LABEL[dados.tipo],
    `Área de ${dados.area_m2} m²`,
    `Complexidade: ${COMPLEXIDADES_LABEL[dados.complexidade]}`,
    ...dados.fatores.map((f) => FATORES_LABEL[f]),
  ];

  const temPerfil = perfil && (perfil.nome || perfil.telefone || perfil.email);

  return (
    <Document>
      <Page size="A4" style={s.page}>

        {/* Header */}
        <View style={s.header}>
          <View>
            <Text style={s.headerTitle}>Orçamento</Text>
            <Text style={s.headerSubtitle}>
              {perfil?.nome ? perfil.nome : "Pintura de Alto Padrão"}
            </Text>
          </View>
          <View>
            {rascunho.numero_orcamento ? (
              <Text style={s.headerDateLabel}>{rascunho.numero_orcamento}</Text>
            ) : null}
            <Text style={s.headerDateLabel}>Emitido em</Text>
            <Text style={s.headerDateValue}>{formatDate(new Date())}</Text>
          </View>
        </View>

        {/* Body */}
        <View style={s.body}>

          {/* Intro */}
          <Text style={s.intro}>
            Proposta de serviço para{" "}
            <Text style={s.introBold}>{cliente}</Text>
            {descricao ? `, conforme escopo descrito abaixo.` : `.`}
          </Text>

          {/* Services list */}
          <View style={s.servicesCard}>
            <Text style={s.servicesHead}>Serviços inclusos</Text>
            {serviceItems.map((item, i) => (
              <View
                key={i}
                style={i < serviceItems.length - 1 ? s.serviceItem : s.serviceItemLast}
              >
                <View style={s.serviceDot} />
                <Text style={s.serviceText}>{item}</Text>
              </View>
            ))}
          </View>

          {/* Investimento */}
          <View style={s.investimento}>
            <Text style={s.invLabel}>Investimento</Text>
            <View style={s.invValueRow}>
              <Text style={s.invCurrency}>R$</Text>
              <Text style={s.invValue}>{formatBRL(dados.valor_final)}</Text>
            </View>
          </View>

          {/* Observações */}
          {rascunho.observacoes ? (
            <View style={s.obsCard}>
              <Text style={s.obsHead}>Observações</Text>
              <Text style={s.obsText}>{rascunho.observacoes}</Text>
            </View>
          ) : null}

          {/* Terms */}
          <Text style={s.termsTitle}>Condições</Text>
          <View style={s.termsGrid}>
            {terms.map((term, i) => (
              <View key={i} style={s.termItem}>
                <View style={s.termDash} />
                <Text style={s.termText}>{term}</Text>
              </View>
            ))}
          </View>

        </View>

        {/* Footer */}
        <View style={s.footer}>
          <View style={s.footerLeft}>
            {perfil?.logo_base64 ? (
              <Image src={perfil.logo_base64} style={s.logoImg} />
            ) : (
              <LogoPDF width={90} />
            )}
            {temPerfil ? (
              <>
                {perfil?.nome ? (
                  <Text style={s.footerPintor}>{perfil.nome}</Text>
                ) : null}
                {perfil?.telefone || perfil?.email ? (
                  <Text style={s.footerContato}>
                    {[perfil?.telefone, perfil?.email].filter(Boolean).join(" · ")}
                  </Text>
                ) : null}
                {perfil?.cidade ? (
                  <Text style={s.footerContato}>{perfil.cidade}</Text>
                ) : null}
              </>
            ) : null}
          </View>
          <Text style={s.footerMeta}>
            Orçamento estimado. Valores podem ser ajustados após inspeção presencial.
          </Text>
        </View>

      </Page>
    </Document>
  );
}
